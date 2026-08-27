const PLAYER_ID_KEY = 'desi-games-anonymous-player-id'

export function getAnonymousPlayerId() {
  let playerId = localStorage.getItem(PLAYER_ID_KEY)
  if (!playerId) {
    playerId = crypto.randomUUID()
    localStorage.setItem(PLAYER_ID_KEY, playerId)
  }
  return playerId
}