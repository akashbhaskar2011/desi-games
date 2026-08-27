import test from 'node:test'
import assert from 'node:assert/strict'
import { RoomRepository } from './RoomRepository.js'

function fakeDatabase() {
  const calls = []
  return {
    calls,
    query: async (sql, params) => {
      calls.push({ sql, params })
      if (sql.startsWith('SELECT r.room_code')) return { rowCount: 2, rows: [{ roomCode: 'ABC123', gameId: 'barah-goti', host_player_id: 'host', status: 'PLAYING', playerId: 'host', name: 'Akash', connected: true, joinedAt: new Date() }, { roomCode: 'ABC123', gameId: 'barah-goti', host_player_id: 'host', status: 'PLAYING', playerId: 'guest', name: 'Rahul', connected: false, joinedAt: new Date() }] }
      return { rowCount: 1, rows: [{ id: 'room-id' }] }
    },
  }
}

test('repository maps persisted room rows to public room data', async () => {
  const database = fakeDatabase()
  const room = await new RoomRepository(database).findRoom('ABC123')
  assert.equal(room.roomCode, 'ABC123')
  assert.equal(room.players.length, 2)
  assert.equal(room.players[1].connected, false)
})

test('repository uses cleanup query', async () => {
  const database = fakeDatabase()
  await new RoomRepository(database).cleanupExpired()
  assert.match(database.calls.at(-1).sql, /DELETE FROM rooms/)
})

test('repository only restores resumable rooms and sessions', async () => {
  const database = fakeDatabase()
  await new RoomRepository(database).loadActiveRooms()
  const sql = database.calls.at(-1).sql
  assert.match(sql, /r\.status IN \('WAITING', 'PLAYING'\)/)
  assert.match(sql, /gs\.status IS NULL OR gs\.status = 'active'/)
})
