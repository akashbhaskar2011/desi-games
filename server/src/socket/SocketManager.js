import crypto from 'node:crypto'

const CHAT_MESSAGE_LIMIT = 200
const CHAT_PAYLOAD_LIMIT = 4 * 1024
const CHAT_RATE_LIMIT = 5
const CHAT_RATE_WINDOW_MS = 10 * 1000

export class SocketManager {
  constructor(io, roomManager, roomRepository = null, logger = console) { this.io = io; this.roomManager = roomManager; this.roomRepository = roomRepository; this.logger = logger; this.moveTimes = new WeakMap(); this.chatTimes = new WeakMap() }

  broadcast(room) { this.io.to(room.roomCode).emit('room:update', this.roomManager.toPublic(room)) }

  attach() {
    this.io.on('connection', (socket) => {
      socket.on('room:join', ({ roomCode, playerId }) => {
        try {
          const room = this.roomManager.connect(roomCode, playerId)
          socket.data.roomCode = room.roomCode
          socket.data.playerId = playerId
          socket.join(room.roomCode)
          this.broadcast(room)
          if (room.gameSession) { room.gameSession.setConnected(playerId, true); socket.emit('game:state', room.gameSession.publicState()); if (room.gameSession.status === 'terminated') socket.emit('game:terminated', { reason: room.gameSession.terminationReason || 'match_stopped', roomCode: room.roomCode }) }
        } catch (error) { socket.emit('room:error', { code: error.code || 'ROOM_ERROR', message: error.message }) }
      })
      socket.on('game:request-state', ({ roomCode } = {}) => {
        const normalizedCode = String(roomCode || socket.data.roomCode || '').trim().toUpperCase()
        const room = this.roomManager.find(normalizedCode)
        if (!room) return socket.emit('game:error', { code: 'ROOM_NOT_FOUND', message: 'This match has expired or no longer exists.' })
        if (socket.data.roomCode !== normalizedCode || !room.players.some((player) => player.id === socket.data.playerId)) return socket.emit('game:error', { code: 'NOT_MEMBER', message: 'You are not a player in this match.' })
        if (!room.gameSession) return socket.emit('game:error', { code: 'GAME_NOT_STARTED', message: 'Game has not started yet.' })
        socket.emit('game:state', room.gameSession.publicState())
      })
      socket.on('chat:send', (payload = {}) => {
        if (!payload || typeof payload !== 'object' || Array.isArray(payload) || JSON.stringify(payload).length > CHAT_PAYLOAD_LIMIT) return socket.emit('chat:error', { message: 'That message is too large.' })
        if (typeof payload.message !== 'string') return socket.emit('chat:error', { message: 'Message must be text.' })
        const message = payload.message.trim()
        if (!message) return socket.emit('chat:error', { message: 'Message cannot be empty.' })
        if (message.length > CHAT_MESSAGE_LIMIT) return socket.emit('chat:error', { message: `Messages can be up to ${CHAT_MESSAGE_LIMIT} characters.` })

        const room = this.roomManager.find(socket.data.roomCode)
        const player = room?.players.find((candidate) => candidate.id === socket.data.playerId)
        const activeGame = room?.status === 'PLAYING' && room.gameSession && !['finished', 'terminated'].includes(room.gameSession.status)
        if (!room || !player || !activeGame) return socket.emit('chat:error', { message: 'Chat is no longer available for this match.' })

        const now = Date.now()
        const recent = (this.chatTimes.get(socket) || []).filter((time) => now - time < CHAT_RATE_WINDOW_MS)
        if (recent.length >= CHAT_RATE_LIMIT) return socket.emit('chat:error', { message: "You're sending messages too quickly." })
        recent.push(now)
        this.chatTimes.set(socket, recent)
        room.lastActivity = now
        this.io.to(room.roomCode).emit('chat:message', { id: crypto.randomUUID(), roomCode: room.roomCode, playerId: player.id, playerName: player.name, message, timestamp: now })
      })
      socket.on('game:terminate', async ({ reason = 'match_stopped' } = {}) => {
        try {
          const result = this.roomManager.terminate(socket.data.roomCode, socket.data.playerId, reason)
          if (result.changed && this.roomRepository) await this.roomRepository.finalizeRoom(result.room)
          if (result.changed) { this.roomManager.remove(result.room.roomCode); this.io.to(result.room.roomCode).emit('game:terminated', { reason, roomCode: result.room.roomCode }) }
          this.logger.info?.('game terminated', { reason })
        } catch (error) { socket.emit('game:error', { code: error.code || 'ROOM_ERROR', message: error.message }) }
      })
      socket.on('game:move', async ({ from, to } = {}) => {
        const now = Date.now(); const previousMove = this.moveTimes.get(socket) || 0
        if (now - previousMove < 150) return socket.emit('game:error', { message: 'Please slow down and try again.' })
        this.moveTimes.set(socket, now)
        const room = this.roomManager.find(socket.data.roomCode)
        if (!room?.gameSession || socket.data.playerId === undefined) return socket.emit('game:error', { message: 'This game is not ready yet.' })
        const result = room.gameSession.move(socket.data.playerId, from, to)
        if (result.error) return socket.emit('game:error', { message: result.error })
        room.lastActivity = Date.now()
        if (result.state.status === 'finished') this.roomManager.finish(room.roomCode)
        try { if (this.roomRepository) { if (result.state.status === 'finished') await this.roomRepository.finalizeRoom(room); else { await this.roomRepository.saveRoom(room); await this.roomRepository.saveGame(room) } } }
        catch { return socket.emit('game:error', { message: 'Your move could not be saved. Please try again.' }) }
        if (result.state.status === 'finished') this.roomManager.remove(room.roomCode)
        this.io.to(room.roomCode).emit('game:state', result.state)
        this.logger.info?.('move accepted', { gameId: room.gameId, moveNumber: result.state.moveNumber })
        if (result.state.status === 'finished') this.io.to(room.roomCode).emit('game:ended', { winner: result.state.winner, winnerRole: result.state.winnerRole, reason: result.state.endReason, moveNumber: result.state.moveNumber, goatsCaptured: result.state.goatsCaptured })
      })
      socket.on('game:rematch-request', async () => {
        const room = this.roomManager.find(socket.data.roomCode)
        if (!room?.gameSession) return socket.emit('game:error', { message: 'This game is not ready yet.' })
        const result = room.gameSession.requestRematch(socket.data.playerId)
        if (result.error) return socket.emit('game:error', { message: result.error })
        if (this.roomRepository) await this.roomRepository.saveGame(room)
        this.io.to(room.roomCode).emit('game:state', result.state)
        if (result.restarted) this.io.to(room.roomCode).emit('game:rematch', { roomCode: room.roomCode })
      })
      socket.on('disconnect', () => {
        const { roomCode, playerId } = socket.data
        const room = this.roomManager.disconnect(roomCode, playerId)
        if (room) { this.broadcast(room); if (room.gameSession) { room.gameSession.setConnected(playerId, false); this.io.to(room.roomCode).emit('game:state', room.gameSession.publicState()) } this.roomRepository?.saveRoom(room).catch(() => {}) }
      })
    })
  }
}
