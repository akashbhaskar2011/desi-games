import crypto from 'node:crypto'
import { BarahGotiGame } from '../games/barah-goti/game.js'
import { games } from '../games/registry.js'

export const ROOM_STATUS = Object.freeze({ WAITING: 'WAITING', PLAYING: 'PLAYING', FINISHED: 'FINISHED' })
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const MAX_PLAYERS = 4
const NAME_LIMIT = 20
const ROOM_TTL_MS = 6 * 60 * 60 * 1000

function cleanCode(roomCode) {
  return String(roomCode || '').trim().toUpperCase()
}

function validateRoomCode(roomCode) {
  const code = cleanCode(roomCode)
  if (!/^[A-Z0-9]{6}$/.test(code)) throw new RoomError('Invalid room code', 400, 'INVALID_ROOM_CODE')
  return code
}

function cleanName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ')
}

function publicRoom(room) {
  return { roomCode: room.roomCode, gameId: room.gameId, hostId: room.hostId, status: room.status, players: room.players.map(({ id, name, connected, joinedAt }) => ({ id, name, connected, joinedAt })) }
}

export class RoomManager {
  constructor({ now = () => Date.now(), codeGenerator = () => this.generateRoomCode() } = {}) {
    this.rooms = new Map()
    this.now = now
    this.codeGenerator = codeGenerator
  }

  generateRoomCode() {
    return Array.from({ length: 6 }, () => CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)]).join('')
  }

  validatePlayer(playerId, name) {
    if (typeof playerId !== 'string' || !/^[a-f0-9-]{16,80}$/i.test(playerId)) throw new RoomError('Invalid player ID', 400, 'INVALID_PLAYER')
    const clean = cleanName(name)
    if (!clean || clean.length > NAME_LIMIT) throw new RoomError(`Name must be between 1 and ${NAME_LIMIT} characters`, 400, 'INVALID_NAME')
    return clean
  }

  find(roomCode) { return this.rooms.get(cleanCode(roomCode)) }

  require(roomCode) {
    const room = this.rooms.get(validateRoomCode(roomCode))
    if (!room) throw new RoomError('Room not found', 404, 'ROOM_NOT_FOUND')
    return room
  }

  create({ gameId, playerId, name }) {
    if (typeof gameId !== 'string' || !games[gameId] || games[gameId].status !== 'playable') throw new RoomError('Invalid game', 400, 'INVALID_GAME')
    const clean = this.validatePlayer(playerId, name)
    let roomCode
    do { roomCode = cleanCode(this.codeGenerator()) } while (this.rooms.has(roomCode))
    const player = { id: playerId, name: clean, connected: true, joinedAt: this.now() }
    const room = { roomCode, gameId, hostId: playerId, players: [player], status: ROOM_STATUS.WAITING, createdAt: this.now(), lastActivity: this.now() }
    this.rooms.set(roomCode, room)
    return room
  }

  join(roomCode, { playerId, name }) {
    const room = this.require(roomCode)
    const clean = this.validatePlayer(playerId, name)
    if (room.status !== ROOM_STATUS.WAITING) throw new RoomError('This game has already started', 409, 'ROOM_STARTED')
    const existing = room.players.find((player) => player.id === playerId)
    if (existing) {
      existing.name = clean
      existing.connected = true
      room.lastActivity = this.now()
      return room
    }
    if (room.players.length >= MAX_PLAYERS) throw new RoomError('Room is full', 409, 'ROOM_FULL')
    room.players.push({ id: playerId, name: clean, connected: true, joinedAt: this.now() })
    room.lastActivity = this.now()
    return room
  }

  connect(roomCode, playerId) {
    const room = this.require(roomCode)
    const player = room.players.find((candidate) => candidate.id === playerId)
    if (!player) throw new RoomError('Player is not a member of this room', 403, 'NOT_MEMBER')
    player.connected = true
    room.lastActivity = this.now()
    return room
  }

  disconnect(roomCode, playerId) {
    const room = this.find(roomCode)
    if (!room) return undefined
    const player = room.players.find((candidate) => candidate.id === playerId)
    if (player) { player.connected = false; room.lastActivity = this.now() }
    return room
  }

  start(roomCode, playerId) {
    const room = this.require(roomCode)
    if (room.hostId !== playerId) throw new RoomError('Only the host can start the game', 403, 'HOST_ONLY')
    const connectedPlayers = room.players.filter((player) => player.connected)
    if (connectedPlayers.length < 2) throw new RoomError('At least two connected players are required', 409, 'NOT_ENOUGH_PLAYERS')
    if (room.gameId === 'barah-goti' && connectedPlayers.length !== 2) throw new RoomError('Barah Goti is limited to two players', 409, 'GAME_PLAYER_LIMIT')
    room.status = ROOM_STATUS.PLAYING
    if (room.gameId === 'barah-goti') {
      room.gameSession = new BarahGotiGame(connectedPlayers, this.now)
      room.players.forEach((player) => { player.role = room.gameSession.player(player.id)?.role || null })
    }
    room.lastActivity = this.now()
    return room
  }

  terminate(roomCode, playerId, reason = 'match_stopped') {
    const room = this.require(roomCode)
    if (!['player_left', 'match_stopped'].includes(reason)) throw new RoomError('Invalid termination reason', 400, 'INVALID_TERMINATION_REASON')
    if (!room.players.some((player) => player.id === playerId)) throw new RoomError('Player is not a member of this room', 403, 'NOT_MEMBER')
    if (room.gameSession?.status === 'terminated' || room.status === ROOM_STATUS.FINISHED) return { room, changed: false }
    room.status = ROOM_STATUS.FINISHED
    if (room.gameSession) { room.gameSession.status = 'terminated'; room.gameSession.terminationReason = reason; room.gameSession.endReason = reason === 'player_left' ? 'The other player left the game.' : 'The match was stopped.' }
    room.lastActivity = this.now()
    return { room, changed: true }
  }

  remove(roomCode) { this.rooms.delete(cleanCode(roomCode)) }

  restore(room) {
    if (room.gameState && room.gameId === 'barah-goti') {
      room.gameSession = new BarahGotiGame(room.players, this.now).restore(room.gameState)
      room.gameSession.players.forEach((player) => { room.players.find((candidate) => candidate.id === player.id).role = player.role })
    }
    delete room.gameState
    this.rooms.set(validateRoomCode(room.roomCode), room)
    return room
  }

  expireRooms() {
    const cutoff = this.now() - ROOM_TTL_MS
    for (const [code, room] of this.rooms) if (room.lastActivity < cutoff) this.rooms.delete(code)
  }

  toPublic(room) { return publicRoom(room) }
}

export class RoomError extends Error {
  constructor(message, status = 400, code = 'ROOM_ERROR') { super(message); this.status = status; this.code = code }
}