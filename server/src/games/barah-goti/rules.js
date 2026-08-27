import { BOARD_ADJACENCY, BOARD_SIZE, GOAT_START, MOVE_LIMIT, TIGER_CAPTURE_TARGET, TIGER_START } from './constants.js'

export const ROLES = Object.freeze({ TIGER: 'TIGER', GOATS: 'GOATS' })

export function createInitialBoard() {
  const board = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
  board[TIGER_START] = ROLES.TIGER
  GOAT_START.forEach((node) => { board[node] = ROLES.GOATS })
  return board
}

export function getCapture(board, from, to) {
  const fromRow = Math.floor(from / BOARD_SIZE); const fromCol = from % BOARD_SIZE
  const toRow = Math.floor(to / BOARD_SIZE); const toCol = to % BOARD_SIZE
  const rowStep = toRow - fromRow; const colStep = toCol - fromCol
  if (Math.abs(rowStep) !== 2 && Math.abs(colStep) !== 2) return null
  if (rowStep !== 0 && colStep !== 0 && Math.abs(rowStep) !== Math.abs(colStep)) return null
  const middle = (fromRow + rowStep / 2) * BOARD_SIZE + fromCol + colStep / 2
  return board[middle] === ROLES.GOATS && board[to] === null ? middle : null
}

export function legalDestinations(board, node, role) {
  if (board[node] !== role) return []
  const destinations = BOARD_ADJACENCY[node].filter((candidate) => board[candidate] === null)
  if (role === ROLES.TIGER) {
    for (let destination = 0; destination < board.length; destination++) if (getCapture(board, node, destination) !== null) destinations.push(destination)
  }
  return [...new Set(destinations)]
}

export function validateMove(board, from, to, role) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to >= board.length) return { valid: false, message: 'That move is outside the board.' }
  if (board[from] !== role) return { valid: false, message: 'You can only move your own piece.' }
  if (board[to] !== null) return { valid: false, message: 'That space is already occupied.' }
  const legal = legalDestinations(board, from, role)
  if (!legal.includes(to)) return { valid: false, message: role === ROLES.TIGER ? 'The tiger can move one step or jump over a goat.' : 'Goats move one connected step at a time.' }
  return { valid: true, capture: role === ROLES.TIGER ? getCapture(board, from, to) : null }
}

export function hasTigerMove(board) { return board.some((piece, node) => piece === ROLES.TIGER && legalDestinations(board, node, ROLES.TIGER).length > 0) }

export function getWinner(board, goatsCaptured, moveNumber) {
  if (goatsCaptured >= TIGER_CAPTURE_TARGET) return { role: ROLES.TIGER, reason: 'The tiger captured five goats.' }
  if (!hasTigerMove(board)) return { role: ROLES.GOATS, reason: 'The goats surrounded the tiger.' }
  if (moveNumber >= MOVE_LIMIT) return { role: null, reason: 'The 200-move safety limit was reached.' }
  return null
}