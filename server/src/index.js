import 'dotenv/config'
import http from 'node:http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { Server } from 'socket.io'
import { config } from './config.js'
import { checkDatabase, pool } from './db/connection.js'
import { RoomRepository } from './db/repositories/RoomRepository.js'
import { logger } from './logger.js'
import { RoomError, RoomManager } from './rooms/RoomManager.js'
import { SocketManager } from './socket/SocketManager.js'

const app = express()
const server = http.createServer(app)
const localOrigins = config.isProduction ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173']
const allowedOrigins = new Set([...config.corsOrigins, ...localOrigins])
const roomRepository = pool ? new RoomRepository() : null
const roomManager = new RoomManager()
const corsOptions = { origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)), methods: ['GET', 'POST'] }
const io = new Server(server, { cors: corsOptions })

app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json({ limit: '10kb' }))
const mutationLimit = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many requests. Please try again shortly.' } })
app.get('/api/health', async (_request, response) => {
  try { const database = await checkDatabase(); response.json({ status: 'ok', database }) }
  catch { response.status(503).json({ status: 'degraded', database: { configured: true, connected: false } }) }
})
app.post('/api/rooms', mutationLimit, async (request, response) => {
  let room
  try { room = roomManager.create(request.body || {}); if (roomRepository) await roomRepository.createRoom({ room, player: room.players[0] }); response.status(201).json({ roomCode: room.roomCode }); logger.info('room created', { gameId: room.gameId }) }
  catch (error) { if (room) roomManager.remove(room.roomCode); sendError(response, error) }
})
app.get('/api/rooms/:roomCode', async (request, response) => {
  try { const room = roomRepository ? await roomRepository.findRoom(request.params.roomCode) : roomManager.find(request.params.roomCode); if (!room) throw new RoomError('Room not found', 404, 'ROOM_NOT_FOUND'); response.json(roomManager.toPublic(room)) }
  catch (error) { sendError(response, error) }
})
app.post('/api/rooms/:roomCode/join', mutationLimit, async (request, response) => {
  try { const room = roomManager.join(request.params.roomCode, request.body || {}); if (roomRepository) await roomRepository.saveRoom(room); response.json(roomManager.toPublic(room)); io.to(room.roomCode).emit('room:update', roomManager.toPublic(room)); logger.info('player joined', { gameId: room.gameId }) }
  catch (error) { sendError(response, error) }
})
app.post('/api/rooms/:roomCode/start', mutationLimit, async (request, response) => {
  try { const room = roomManager.start(request.params.roomCode, request.body?.playerId); if (roomRepository) { await roomRepository.saveRoom(room); await roomRepository.saveGame(room) } response.json({ roomCode: room.roomCode, status: room.status }); io.to(room.roomCode).emit('game:started', { roomCode: room.roomCode, gameId: room.gameId }); logger.info('game started', { gameId: room.gameId }) }
  catch (error) { sendError(response, error) }
})
app.post('/api/rooms/:roomCode/terminate', mutationLimit, async (request, response) => {
  try { const reason = request.body?.reason || 'match_stopped'; const result = roomManager.terminate(request.params.roomCode, request.body?.playerId, reason); if (result.changed && roomRepository) await roomRepository.finalizeRoom(result.room); if (result.changed) { roomManager.remove(result.room.roomCode); io.to(result.room.roomCode).emit('game:terminated', { reason, roomCode: result.room.roomCode }) }; response.json({ roomCode: result.room.roomCode, status: result.room.status }) }
  catch (error) { sendError(response, error) }
})

app.use((error, _request, response, _next) => {
  logger.error('request failed', { message: error.message })
  response.status(error.status || 500).json({ error: error.status ? error.message : 'Something went wrong' })
})

function sendError(response, error) {
  const roomError = error instanceof RoomError ? error : new RoomError('Something went wrong', 500, 'SERVER_ERROR')
  response.status(roomError.status).json({ error: roomError.message, code: roomError.code })
}

new SocketManager(io, roomManager, roomRepository, logger).attach()
setInterval(async () => { roomManager.expireRooms(); if (roomRepository) await roomRepository.cleanupExpired() }, 15 * 60 * 1000).unref()

async function start() {
  if (roomRepository) for (const room of await roomRepository.loadActiveRooms()) roomManager.restore(room)
  server.listen(config.port, () => logger.info('server started', { port: config.port }))
}

start().catch((error) => { logger.error('server startup failed', { message: error.message }); process.exitCode = 1 })

export { app, roomManager, server }
