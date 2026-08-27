import { BOARD_EDGES, BOARD_NODES } from './constants'
import { legalMoves } from './rules'
import { Piece } from './Piece'
import { useState } from 'react'

const BOARD_INSET = 7
const BOARD_SPAN = 100 - BOARD_INSET * 2
const boardPoint = ({ row, col }) => ({ x: BOARD_INSET + col * BOARD_SPAN / 4, y: BOARD_INSET + row * BOARD_SPAN / 4 })

export function Board({ board, role, turn, playerId, onMove, disabled = false }) {
  const [selected, setSelected] = useState(null)
  const moves = selected === null ? [] : legalMoves(board, selected, role)
  function choose(node) { if (disabled) return; if (moves.includes(node)) { onMove(selected, node); setSelected(null) } else if (board[node] === role && turn === playerId) setSelected(node) }
  return <div className="play-board" role="grid" aria-label="Barah Goti board"><svg className="board-lines" viewBox="0 0 100 100" aria-hidden="true"><rect className="board-frame" x={BOARD_INSET} y={BOARD_INSET} width={BOARD_SPAN} height={BOARD_SPAN} />{BOARD_EDGES.map(([from, to]) => { const start = boardPoint(BOARD_NODES[from]); const end = boardPoint(BOARD_NODES[to]); return <line key={`${from}-${to}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} /> })}</svg>{BOARD_NODES.map((node) => { const point = boardPoint(node); return <div role="gridcell" aria-label={`Board node ${node.id + 1}`} className={`board-node ${moves.includes(node.id) ? 'node-legal' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => choose(node.id)} key={node.id}>{board[node.id] && <Piece type={board[node.id]} selected={selected === node.id} movable={moves.includes(node.id)} own={board[node.id] === role} onClick={() => choose(node.id)} />}{moves.includes(node.id) && !board[node.id] && <span className="legal-dot" />}</div> })}</div>
}
