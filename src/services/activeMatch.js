import { apiRequest } from '../lib/api.js'

export const ACTIVE_MATCH_KEY = 'desi_active_match'
const RECENT_MATCH_TTL = 30 * 60 * 1000

function storage() { return typeof localStorage === 'undefined' ? null : localStorage }
function notify() { if (typeof window !== 'undefined') window.dispatchEvent(new Event('desi-active-match-change')) }
function write(record) { storage()?.setItem(ACTIVE_MATCH_KEY, JSON.stringify(record)); return record }

export function saveActiveMatch(match) {
  const record = { ...match, status: match.status || 'active', lastSeenAt: new Date().toISOString() }
  write(record); notify(); return record
}

export function getActiveMatch() {
  const raw = storage()?.getItem(ACTIVE_MATCH_KEY)
  if (!raw) return null
  try {
    const match = JSON.parse(raw)
    if (match.status === 'finished' && Date.now() - new Date(match.finishedAt || match.lastSeenAt).getTime() > RECENT_MATCH_TTL) { clearActiveMatch(); return null }
    return match
  } catch { clearActiveMatch(); return null }
}

export function hasActiveMatch() { return Boolean(getActiveMatch()) }

export function updateActiveMatch(patch) {
  const current = getActiveMatch()
  return current ? saveActiveMatch({ ...current, ...patch }) : null
}

export function clearActiveMatch() { storage()?.removeItem(ACTIVE_MATCH_KEY); notify() }

export async function verifyActiveMatch() {
  const current = getActiveMatch()
  if (!current) return null
  try {
    const room = await apiRequest(`/api/rooms/${current.roomCode}`)
    const verified = { ...current, gameId: room.gameId, players: room.players, roomStatus: room.status, lastSeenAt: new Date().toISOString() }
    return write(verified)
  } catch (error) {
    if (error.status === 404) clearActiveMatch()
    throw error
  }
}