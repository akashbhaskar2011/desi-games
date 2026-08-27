import { createInitialBoard, getWinner, ROLES, validateMove } from './rules.js'

export class BarahGotiGame {
  constructor(players, now = () => Date.now()) {
    this.now = now
    this.players = players.map((player, index) => ({ id: player.id, name: player.name, connected: player.connected !== false, role: index === 0 ? ROLES.TIGER : ROLES.GOATS }))
    this.reset()
  }

  reset() {
    this.status = 'playing'; this.terminationReason = null; this.board = createInitialBoard(); this.turn = this.players[0].id; this.goatsPlaced = 12; this.goatsCaptured = 0; this.winner = null; this.winnerRole = null; this.moveNumber = 0; this.moveHistory = []; this.rematchRequests = new Set()
  }

  player(playerId) { return this.players.find((player) => player.id === playerId) }

  setConnected(playerId, connected) {
    const player = this.player(playerId)
    if (player) player.connected = connected
  }

  restore(state) {
    this.status = state.status; this.terminationReason = state.terminationReason || null; this.board = state.board; this.turn = state.turn; this.goatsPlaced = state.goatsPlaced; this.goatsCaptured = state.goatsCaptured; this.winner = state.winner; this.winnerRole = state.winnerRole; this.endReason = state.endReason; this.moveNumber = state.moveNumber; this.moveHistory = state.moveHistory || []; this.rematchRequests = new Set(state.rematchRequests || [])
    return this
  }

  move(playerId, from, to) {
    if (this.status !== 'playing') return { error: 'This game has already ended.' }
    const player = this.player(playerId)
    if (!player) return { error: 'You are not a player in this game.' }
    if (this.turn !== playerId) return { error: 'It is not your turn yet.' }
    const result = validateMove(this.board, from, to, player.role === ROLES.TIGER ? ROLES.TIGER : ROLES.GOATS)
    if (!result.valid) return { error: result.message }
    this.board[from] = null; this.board[to] = player.role === ROLES.TIGER ? ROLES.TIGER : ROLES.GOATS
    if (result.capture !== null) { this.board[result.capture] = null; this.goatsCaptured += 1 }
    this.moveNumber += 1
    this.moveHistory.push({ moveNumber: this.moveNumber, playerId, from, to, capture: result.capture, timestamp: new Date(this.now()).toISOString() })
    const winner = getWinner(this.board, this.goatsCaptured, this.moveNumber)
    if (winner) { this.status = 'finished'; this.winnerRole = winner.role; this.winner = winner.role ? this.players.find((candidate) => candidate.role === winner.role)?.id : null; this.endReason = winner.reason }
    else this.turn = this.players.find((candidate) => candidate.id !== playerId)?.id
    return { state: this.publicState(), move: this.moveHistory.at(-1) }
  }

  requestRematch(playerId) {
    if (!this.player(playerId)) return { error: 'You are not a player in this game.' }
    if (this.status !== 'finished') return { error: 'Rematches are available after the game ends.' }
    this.rematchRequests.add(playerId)
    if (this.players.every((player) => this.rematchRequests.has(player.id))) { this.reset(); return { state: this.publicState(), restarted: true } }
    return { state: this.publicState(), restarted: false }
  }

  publicState() {
    return { gameId: 'barah-goti', status: this.status, terminationReason: this.terminationReason, players: this.players, board: this.board, turn: this.turn, goatsPlaced: this.goatsPlaced, goatsCaptured: this.goatsCaptured, winner: this.winner, winnerRole: this.winnerRole, endReason: this.endReason || null, moveNumber: this.moveNumber, rematchRequests: [...this.rematchRequests] }
  }
}