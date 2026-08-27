import test from 'node:test'
import assert from 'node:assert/strict'
import { RoomManager } from './RoomManager.js'

const player = (suffix) => ({ playerId: `12345678-1234-1234-1234-${suffix.padStart(12, '0')}`, name: suffix })

test('creates unique six-character rooms and makes creator host', () => {
  const manager = new RoomManager({ codeGenerator: () => 'A7K92P' })
  const room = manager.create({ gameId: 'barah-goti', ...player('1') })
  assert.equal(room.roomCode, 'A7K92P')
  assert.equal(room.hostId, room.players[0].id)
})

test('enforces capacity and host-only start', () => {
  let code = 0
  const manager = new RoomManager({ codeGenerator: () => `A7K9${++code}Q` })
  const host = player('1')
  const room = manager.create({ gameId: 'barah-goti', ...host })
  manager.join(room.roomCode, { ...player('2') })
  assert.throws(() => manager.start(room.roomCode, player('2').playerId), /Only the host/)
  manager.start(room.roomCode, host.playerId)
  assert.equal(room.status, 'PLAYING')
})