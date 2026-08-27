import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { ACTIVE_MATCH_KEY, clearActiveMatch, getActiveMatch, saveActiveMatch, updateActiveMatch, verifyActiveMatch } from './activeMatch.js'

const store = new Map()
global.localStorage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, value), removeItem: (key) => store.delete(key) }

beforeEach(() => { store.clear() })

test('saves and updates only the resumable match reference', () => {
  saveActiveMatch({ roomCode: 'ABC123', gameId: 'barah-goti', playerId: 'player-1', playerName: 'Akash' })
  assert.equal(getActiveMatch().roomCode, 'ABC123')
  assert.equal(getActiveMatch().board, undefined)
  updateActiveMatch({ players: [{ id: 'player-1', name: 'Akash' }] })
  assert.equal(getActiveMatch().players.length, 1)
})

test('clears a match only after the room lookup confirms 404', async () => {
  saveActiveMatch({ roomCode: 'ABC123', gameId: 'barah-goti', playerId: 'player-1', playerName: 'Akash' })
  global.fetch = async () => ({ ok: false, status: 404, json: async () => ({ error: 'Room not found' }) })
  await assert.rejects(() => verifyActiveMatch(), { message: 'Room not found' })
  assert.equal(localStorage.getItem(ACTIVE_MATCH_KEY), null)
  clearActiveMatch()
})