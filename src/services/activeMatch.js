import { apiRequest } from "../lib/api.js";

export const ACTIVE_MATCH_KEY = "desi_active_match";
const NON_RESUMABLE_STATUSES = new Set([
  "finished",
  "completed",
  "terminated",
  "stopped",
  "expired",
]);

function storage() {
  return typeof localStorage === "undefined" ? null : localStorage;
}
function notify() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("desi-active-match-change"));
}
function write(record) {
  storage()?.setItem(ACTIVE_MATCH_KEY, JSON.stringify(record));
  return record;
}

export function saveActiveMatch(match) {
  const record = {
    ...match,
    status: match.status || "active",
    lastSeenAt: new Date().toISOString(),
  };
  write(record);
  notify();
  return record;
}

export function getActiveMatch() {
  const raw = storage()?.getItem(ACTIVE_MATCH_KEY);
  if (!raw) return null;
  try {
    const match = JSON.parse(raw);
    if (
      NON_RESUMABLE_STATUSES.has(String(match.status || "").toLowerCase()) ||
      match.roomStatus === "FINISHED"
    ) {
      clearActiveMatch();
      return null;
    }
    return match;
  } catch {
    clearActiveMatch();
    return null;
  }
}

export function hasActiveMatch() {
  return Boolean(getActiveMatch());
}

export function updateActiveMatch(patch) {
  const current = getActiveMatch();
  return current ? saveActiveMatch({ ...current, ...patch }) : null;
}

export function clearActiveMatch() {
  storage()?.removeItem(ACTIVE_MATCH_KEY);
  notify();
}

export function clearActiveMatchForRoom(roomCode) {
  const current = getActiveMatch();
  if (
    current?.roomCode ===
    String(roomCode || "")
      .trim()
      .toUpperCase()
  )
    clearActiveMatch();
}

export function isViewingMatch(pathname, roomCode) {
  const match = String(pathname || "").match(/^\/(?:room|play)\/([^/]+)\/?$/);
  return Boolean(
    match &&
    String(match[1]).toUpperCase() === String(roomCode || "").toUpperCase(),
  );
}

export async function verifyActiveMatch() {
  const current = getActiveMatch();
  if (!current) return null;
  try {
    const room = await apiRequest(`/api/rooms/${current.roomCode}`);
    if (room.status === "FINISHED") {
      clearActiveMatchForRoom(current.roomCode);
      return null;
    }
    const verified = {
      ...current,
      gameId: room.gameId,
      players: room.players,
      roomStatus: room.status,
      lastSeenAt: new Date().toISOString(),
    };
    return write(verified);
  } catch (error) {
    if (error.status === 404) clearActiveMatchForRoom(current.roomCode);
    throw error;
  }
}
