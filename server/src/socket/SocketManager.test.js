import test from 'node:test'
import assert from 'node:assert/strict'
import { RoomManager } from '../rooms/RoomManager.js'
import { SocketManager } from './SocketManager.js'

function fakeSocket() {
  const handlers = {}
  const socket = { data: {}, joined: [], emitted: [], on: (event, handler) => { handlers[event] = handler }, join: (room) => socket.joined.push(room), emit: (event, payload) => socket.emitted.push({ event, payload }), trigger: (event, payload) => handlers[event]?.(payload) }
  return socket
}
const socket = fakeSocket()

const fakeIo = { on: (event, handler) => { if (event === 'connection') fakeIo.handler = handler }, to: () => ({ emit: () => {} }) }

test('game:request-state returns the current state only to a verified member', () => {
  const manager = new RoomManager({ codeGenerator: () => 'ABC123' })
  const room = manager.create({ gameId: 'barah-goti', playerId: '11111111-1111-1111-1111-111111111111', name: 'Tiger' })
  manager.join(room.roomCode, { playerId: '22222222-2222-2222-2222-222222222222', name: 'Goat' })
  manager.start(room.roomCode, room.hostId)
  new SocketManager(fakeIo, manager).attach()
  fakeIo.handler(socket)
  socket.data.roomCode = room.roomCode
  socket.data.playerId = room.hostId
  socket.trigger('game:request-state', { roomCode: room.roomCode })
  assert.equal(socket.emitted.at(-1).event, 'game:state')
  assert.equal(socket.emitted.at(-1).payload.moveNumber, 0)
})

test('game:request-state rejects a non-member', () => {
  const manager = new RoomManager({ codeGenerator: () => 'ABC123' })
  const room = manager.create({ gameId: 'barah-goti', playerId: '11111111-1111-1111-1111-111111111111', name: 'Tiger' })
  const testSocket = fakeSocket(); const io = { on: (_event, handler) => { handler(testSocket) }, to: () => ({ emit: () => {} }) }
  new SocketManager(io, manager).attach(); testSocket.data.roomCode = room.roomCode; testSocket.data.playerId = '33333333-3333-3333-3333-333333333333'; testSocket.trigger('game:request-state', { roomCode: room.roomCode })
  assert.equal(testSocket.emitted.at(-1).event, 'game:error'); assert.equal(testSocket.emitted.at(-1).payload.code, 'NOT_MEMBER')
})

test('game:terminate broadcasts the player-left reason once', async () => {
  const manager = new RoomManager({ codeGenerator: () => 'ABC123' })
  const room = manager.create({ gameId: 'barah-goti', playerId: '11111111-1111-1111-1111-111111111111', name: 'Tiger' })
  manager.join(room.roomCode, { playerId: '22222222-2222-2222-2222-222222222222', name: 'Goat' }); manager.start(room.roomCode, room.hostId)
  const emitted = []; const terminationSocket = fakeSocket(); const io = { on: (_event, handler) => { handler(terminationSocket) }, to: () => ({ emit: (event, payload) => emitted.push({ event, payload }) }) }
  new SocketManager(io, manager).attach(); terminationSocket.data.roomCode = room.roomCode; terminationSocket.data.playerId = room.hostId
  terminationSocket.trigger('game:terminate', { reason: 'player_left' }); await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(emitted.filter((event) => event.event === 'game:terminated').length, 1); assert.equal(emitted[0].payload.reason, 'player_left'); assert.equal(manager.find(room.roomCode), undefined)
})
