import test from 'node:test'
import assert from 'node:assert/strict'
import { BarahGotiGame } from './game.js'
import { createInitialBoard, legalDestinations, ROLES, validateMove } from './rules.js'

const players = [{ id: 'tiger-player', name: 'Tiger' }, { id: 'goat-player', name: 'Goats' }]

test('initial board has one tiger and twelve goats', () => { const board = createInitialBoard(); assert.equal(board.filter((piece) => piece === ROLES.TIGER).length, 1); assert.equal(board.filter((piece) => piece === ROLES.GOATS).length, 12); assert.equal(board[12], ROLES.TIGER) })
test('tiger has step and capture destinations', () => { const board = createInitialBoard(); assert.ok(legalDestinations(board, 12, ROLES.TIGER).includes(13)); assert.ok(legalDestinations(board, 12, ROLES.TIGER).includes(2)) })
test('tiger exposes multiple capture choices when available', () => { const board = Array(25).fill(null); board[12] = ROLES.TIGER; board[7] = ROLES.GOATS; board[11] = ROLES.GOATS; assert.ok(legalDestinations(board, 12, ROLES.TIGER).includes(2)); assert.ok(legalDestinations(board, 12, ROLES.TIGER).includes(10)) })
test('goat moves one adjacent empty space', () => { const board = createInitialBoard(); assert.ok(legalDestinations(board, 14, ROLES.GOATS).includes(13)); assert.equal(validateMove(board, 14, 13, ROLES.GOATS).valid, true) })
test('invalid ownership and destinations are rejected', () => { const board = createInitialBoard(); assert.match(validateMove(board, 0, 2, ROLES.TIGER).message, /own/); assert.equal(validateMove(board, 0, 24, ROLES.GOATS).valid, false) })
test('game captures a goat and switches turn', () => { const game = new BarahGotiGame(players); const result = game.move('tiger-player', 12, 2); assert.equal(result.move.capture, 7); assert.equal(game.goatsCaptured, 1); assert.equal(game.turn, 'goat-player'); assert.equal(game.board[7], null) })
test('cannot move during opponent turn or after game ends', () => { const game = new BarahGotiGame(players); assert.match(game.move('goat-player', 0, 13).error, /turn/); game.goatsCaptured = 5; game.status = 'finished'; assert.match(game.move('tiger-player', 12, 13).error, /ended/) })
test('tiger wins at five captures and game stops', () => { const game = new BarahGotiGame(players); game.goatsCaptured = 4; const result = game.move('tiger-player', 12, 2); assert.equal(result.state.status, 'finished'); assert.equal(result.state.winnerRole, ROLES.TIGER); assert.equal(game.move('goat-player', 0, 13).error, 'This game has already ended.') })
test('rematch requires both players and resets state', () => { const game = new BarahGotiGame(players); game.status = 'finished'; assert.equal(game.requestRematch('tiger-player').restarted, false); const result = game.requestRematch('goat-player'); assert.equal(result.restarted, true); assert.equal(result.state.moveNumber, 0); assert.equal(result.state.goatsCaptured, 0) })