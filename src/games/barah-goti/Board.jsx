import { BOARD_EDGES, BOARD_NODES } from './constants'
import { legalMoves } from './rules'
import { Piece } from './Piece'
import { useState } from 'react'

export function Board({ board, role, turn, playerId, onMove }) {
  const [selected, setSelected] = useState(null)
  const moves = selected === null ? [] : legalMoves(board, selected, role)
  function choose(node) { if (moves.includes(node)) { onMove(selected, node); setSelected(null) } else if (board[node] === role && turn === playerId) setSelected(node) }
  return <div className="play-board" role="grid" aria-label="Barah Goti board"><svg className="board-lines" viewBox="0 0 100 100" aria-hidden="true">{BOARD_EDGES.map(([from, to]) => <line key={`${from}-${to}`} x1={BOARD_NODES[from].col * 25 + 12.5} y1={BOARD_NODES[from].row * 25 + 12.5} x2={BOARD_NODES[to].col * 25 + 12.5} y2={BOARD_NODES[to].row * 25 + 12.5} />)}</svg>{BOARD_NODES.map((node) => <div role="gridcell" aria-label={`Board node ${node.id + 1}`} className={`board-node ${moves.includes(node.id) ? 'node-legal' : ''}`} style={{ left: `${node.col * 25 + 12.5}%`, top: `${node.row * 25 + 12.5}%` }} onClick={() => choose(node.id)} key={node.id}>{board[node.id] && <Piece type={board[node.id]} selected={selected === node.id} movable={moves.includes(node.id)} own={board[node.id] === role} onClick={() => choose(node.id)} />}{moves.includes(node.id) && !board[node.id] && <span className="legal-dot" />}</div>)}</div>
}