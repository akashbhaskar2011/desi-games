import { BOARD_SIZE, BOARD_NODES } from './constants'

export function captureNode(board, from, to) {
  const fromRow = Math.floor(from / BOARD_SIZE); const fromCol = from % BOARD_SIZE; const toRow = Math.floor(to / BOARD_SIZE); const toCol = to % BOARD_SIZE
  const rowStep = toRow - fromRow; const colStep = toCol - fromCol
  if (Math.abs(rowStep) !== 2 && Math.abs(colStep) !== 2) return null
  if (rowStep !== 0 && colStep !== 0 && Math.abs(rowStep) !== Math.abs(colStep)) return null
  const middle = (fromRow + rowStep / 2) * BOARD_SIZE + fromCol + colStep / 2
  return board[middle] === 'GOATS' && board[to] === null ? middle : null
}

export function legalMoves(board, node, role) {
  if (board[node] !== role) return []
  const current = BOARD_NODES[node]
  const moves = BOARD_NODES.filter((candidate) => candidate.id !== node && Math.abs(candidate.row - current.row) <= 1 && Math.abs(candidate.col - current.col) <= 1 && board[candidate.id] === null).map((candidate) => candidate.id)
  if (role === 'TIGER') BOARD_NODES.forEach((candidate) => { if (captureNode(board, node, candidate.id) !== null) moves.push(candidate.id) })
  return [...new Set(moves)]
}