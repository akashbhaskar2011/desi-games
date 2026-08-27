import { pool } from '../connection.js'

export class RoomRepository {
  constructor(database = pool) { this.database = database }

  async upsertPlayer({ anonymousId, displayName }) {
    const result = await this.database.query(`INSERT INTO players (anonymous_id, display_name) VALUES ($1, $2) ON CONFLICT (anonymous_id) DO UPDATE SET display_name = EXCLUDED.display_name, last_seen_at = now() RETURNING id, anonymous_id AS "anonymousId", display_name AS "displayName"`, [anonymousId, displayName])
    return result.rows[0]
  }

  async createRoom({ room, player }) {
    const client = await this.database.connect()
    try {
      await client.query('BEGIN')
      const playerResult = await client.query(`INSERT INTO players (anonymous_id, display_name) VALUES ($1, $2) ON CONFLICT (anonymous_id) DO UPDATE SET display_name = EXCLUDED.display_name, last_seen_at = now() RETURNING id`, [player.id, player.name])
      const playerRow = { id: playerResult.rows[0].id }
      const roomRow = await client.query(`INSERT INTO rooms (room_code, game_id, host_player_id, status, expires_at) VALUES ($1, $2, $3, $4, now() + interval '6 hours') RETURNING id`, [room.roomCode, room.gameId, playerRow.id, room.status])
      await client.query(`INSERT INTO room_players (room_id, player_id, role) VALUES ($1, $2, $3)`, [roomRow.rows[0].id, playerRow.id, null])
      await client.query('COMMIT')
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
  }

  async saveRoom(room) {
    const result = await this.database.query(`UPDATE rooms SET status = $2, updated_at = now(), expires_at = now() + interval '6 hours' WHERE room_code = $1 RETURNING id`, [room.roomCode, room.status])
    if (!result.rowCount) return
    for (const player of room.players) {
      const playerRow = await this.database.query(`INSERT INTO players (anonymous_id, display_name) VALUES ($1, $2) ON CONFLICT (anonymous_id) DO UPDATE SET display_name = EXCLUDED.display_name, last_seen_at = now() RETURNING id`, [player.id, player.name])
      await this.database.query(`INSERT INTO room_players (room_id, player_id, role, connected) VALUES ($1, $2, $3, $4) ON CONFLICT (room_id, player_id) DO UPDATE SET connected = EXCLUDED.connected, last_seen_at = now()`, [result.rows[0].id, playerRow.rows[0].id, player.role || null, player.connected])
    }
  }

  async saveGame(room) {
    if (!room.gameSession) return
    const client = await this.database.connect()
    try {
      await client.query('BEGIN')
      const roomRow = await client.query('SELECT id FROM rooms WHERE room_code = $1', [room.roomCode])
      const game = room.gameSession.publicState()
      const winner = game.winner ? await client.query('SELECT id FROM players WHERE anonymous_id = $1', [game.winner]) : { rows: [{ id: null }] }
      const session = await client.query(`INSERT INTO game_sessions (room_id, game_id, state, status, winner_player_id, finished_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (room_id) DO UPDATE SET state = EXCLUDED.state, status = EXCLUDED.status, winner_player_id = EXCLUDED.winner_player_id, updated_at = now(), finished_at = EXCLUDED.finished_at RETURNING id`, [roomRow.rows[0].id, game.gameId, game, game.status, winner.rows[0].id, game.status === 'finished' ? new Date() : null])
      const sessionId = session.rows[0].id
      for (const move of room.gameSession.moveHistory) await client.query(`INSERT INTO game_moves (game_session_id, move_number, player_id, from_position, to_position, captured_position, created_at) VALUES ($1, $2, (SELECT id FROM players WHERE anonymous_id = $3), $4, $5, $6, $7) ON CONFLICT DO NOTHING`, [sessionId, move.moveNumber, move.playerId, move.from, move.to, move.capture, move.timestamp])
      await client.query('COMMIT')
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
  }

  async findRoom(roomCode) {
    const result = await this.database.query(`SELECT r.room_code AS "roomCode", r.game_id AS "gameId", r.status, r.host_player_id, r.expires_at, p.anonymous_id AS "playerId", p.display_name AS name, rp.connected, rp.joined_at AS "joinedAt" FROM rooms r JOIN room_players rp ON rp.room_id = r.id JOIN players p ON p.id = rp.player_id WHERE r.room_code = $1 AND r.expires_at > now()`, [roomCode])
    if (!result.rowCount) return null
    const first = result.rows[0]
    return { roomCode: first.roomCode, gameId: first.gameId, hostId: first.host_player_id, status: first.status, players: result.rows.map(({ playerId, name, connected, joinedAt }) => ({ id: playerId, name, connected, joinedAt })) }
  }

  async loadActiveRooms() {
    const result = await this.database.query(`SELECT r.id AS "roomId", r.room_code AS "roomCode", r.game_id AS "gameId", host.anonymous_id AS "hostPlayerId", r.status, r.created_at AS "createdAt", r.updated_at AS "updatedAt", p.anonymous_id AS "playerId", p.display_name AS name, rp.role, rp.connected, rp.joined_at AS "joinedAt", gs.state AS "gameState" FROM rooms r JOIN players host ON host.id = r.host_player_id JOIN room_players rp ON rp.room_id = r.id JOIN players p ON p.id = rp.player_id LEFT JOIN game_sessions gs ON gs.room_id = r.id WHERE r.expires_at > now()`)
    const rooms = new Map()
    for (const row of result.rows) {
      if (!rooms.has(row.roomCode)) rooms.set(row.roomCode, { roomCode: row.roomCode, gameId: row.gameId, hostId: row.hostPlayerId, status: row.status, players: [], createdAt: new Date(row.createdAt).getTime(), lastActivity: new Date(row.updatedAt).getTime(), gameState: row.gameState })
      rooms.get(row.roomCode).players.push({ id: row.playerId, name: row.name, role: row.role, connected: false, joinedAt: new Date(row.joinedAt).getTime() })
    }
    return [...rooms.values()]
  }

  async cleanupExpired() { await this.database.query(`DELETE FROM rooms WHERE expires_at <= now()`) }
}