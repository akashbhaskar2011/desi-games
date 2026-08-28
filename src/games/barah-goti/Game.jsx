import { useState } from 'react'
import { BookOpen, Share2, Trophy } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Board } from './Board'
import { ConnectionStatus } from '../../components/ConnectionStatus'
import { RoomCode } from '../../components/RoomCode'
import { ShareButtons } from '../../components/ShareButtons'
import { useGame } from '../../hooks/useGame'
import { clearActiveMatchForRoom } from '../../services/activeMatch'
import { apiRequest } from '../../lib/api'
import { RoomChat } from '../../components/RoomChat'

function PlayerStat({ player, current, you, captured, status }) {
  return <div className={`game-player ${current ? 'game-player-current' : ''}`}><div className="game-player-icon">{player.role === 'TIGER' ? '🐯' : '🐐'}</div><div><span className="game-player-label">{you ? 'YOU' : 'OPPONENT'} / {player.role}</span><strong>{player.name}</strong>{status && <small className="game-player-status">{status}</small>}</div><span className="captured-count">{captured} <small>CAPTURED</small></span></div>
}

function InGameRules() {
  return <section className="in-game-rules" aria-labelledby="in-game-rules-title"><div className="rules-heading"><div><p className="eyebrow">Quick reference</p><h2 id="in-game-rules-title"><BookOpen size={18} /> Rules</h2></div><Link to="/how-to-play" className="rules-full-link">View Full Rules <span>↗</span></Link></div><div className="rules-columns"><div><strong>🐯 Tiger</strong><p>Move one connected step or jump over one adjacent goat to an empty node to capture it.</p></div><div><strong>🐐 Goats</strong><p>Move one step along a connection to an empty node. Goats surround the tiger.</p></div><div><strong>🎯 Objective</strong><p>The tiger captures five goats. The goats win when the tiger has no legal move.</p></div></div></section>
}

function LeavePrompt({ onClose, onLeave, onStop }) {
  return <div className="game-modal-backdrop"><div className="game-modal leave-modal"><p className="eyebrow">Match protection</p><h2>Leave this match?</h2><p>Your current match will remain active, and you can return later.</p><button className="button button-primary" onClick={onClose}>Continue playing</button><button className="button button-secondary" onClick={onLeave}>Leave Game</button><button className="abandon-button" onClick={onStop}>Stop Match</button></div></div>
}

export function Game() {
  const { roomCode } = useParams()
  const { state, connection, error, playerId, move, rematch, chatMessages, chatError, sendChat, retry, clearError } = useGame(roomCode.toUpperCase())
  const [shareOpen, setShareOpen] = useState(false)
  const [leavePrompt, setLeavePrompt] = useState(false)
  const navigate = useNavigate()
  if (!state) return <section className="page-width loading-page"><ConnectionStatus state={connection} /><p>{error || 'Reconnecting to your match…'}</p>{error && <><button className="button button-primary" onClick={retry}>Try again</button><Link to="/games" className="button button-secondary">Back to games</Link></>}</section>
  const current = state.players.find((player) => player.id === playerId)
  const opponent = state.players.find((player) => player.id !== playerId)
  const isTurn = state.turn === playerId
  const won = state.winner === playerId
  const finished = state.status === 'finished'
  const terminated = state.status === 'terminated'
  if (!current) return <section className="page-width loading-page"><p>You are not a player in this game.</p><Link to="/games" className="button button-secondary">Back to games</Link></section>
  const exitGame = async () => {
    if (terminated) { clearActiveMatchForRoom(roomCode); navigate('/games'); return }
    try { await apiRequest(`/api/rooms/${roomCode}/terminate`, { method: 'POST', body: JSON.stringify({ playerId, reason: 'player_left' }) }); clearActiveMatchForRoom(roomCode) } finally { navigate('/games') }
  }
  const leaveGame = exitGame
  const stopMatch = async () => { try { await apiRequest(`/api/rooms/${roomCode}/terminate`, { method: 'POST', body: JSON.stringify({ playerId, reason: 'match_stopped' }) }); clearActiveMatchForRoom(roomCode) } finally { navigate('/games') } }
  return <section className="game-page"><header className="game-header"><Link to="/games" className="game-brand"><span className="brand-mark">✦</span> DESI GAMES</Link><div className="game-header-room"><span>BARAH GOTI</span><RoomCode code={roomCode.toUpperCase()} /></div><div className="game-header-actions"><ConnectionStatus state={connection} /><button onClick={() => setShareOpen(!shareOpen)} aria-label="Share room"><Share2 size={17} /> <span>Share</span></button><button className="leave-link" onClick={() => setLeavePrompt(true)}>Exit Game</button></div></header>{shareOpen && <div className="game-share"><ShareButtons roomCode={roomCode.toUpperCase()} gameName="Barah Goti" /></div>}{leavePrompt && <LeavePrompt onClose={() => setLeavePrompt(false)} onLeave={leaveGame} onStop={stopMatch} />}<main className="game-main page-width"><div className={`turn-banner ${isTurn && !finished && !terminated ? 'turn-active' : ''}`}>{terminated ? 'MATCH ENDED' : finished ? 'GAME FINISHED' : isTurn ? 'YOUR TURN' : `${opponent?.name || 'Opponent'}’S TURN`}<span>{error || (terminated ? (state.terminationReason === 'player_left' ? 'Other player left the game.' : 'Match stopped.') : opponent && !opponent.connected ? 'Your opponent left. Waiting for them to reconnect…' : isTurn ? 'Choose a piece to move' : 'Watch the board')}</span></div><div className="game-layout game-layout-with-chat"><aside className="game-side game-side-left"><PlayerStat player={current} current={isTurn && !finished && !terminated} you captured={current.role === 'TIGER' ? state.goatsCaptured : 0} /></aside><div className="board-wrap"><Board board={state.board} role={current.role} turn={state.turn} playerId={playerId} onMove={move} disabled={finished || terminated} /><div className="board-help"><span>MOVE {String(state.moveNumber).padStart(2, '0')}</span></div><InGameRules /></div><aside className="game-side game-side-right"><PlayerStat player={opponent || current} current={state.turn === opponent?.id && !finished && !terminated} captured={opponent?.role === 'TIGER' ? state.goatsCaptured : 0} /></aside><RoomChat messages={chatMessages} playerId={playerId} disabled={finished || terminated || connection !== 'connected'} error={chatError} onSend={sendChat} /></div><div className="game-footer-stats"><span><Trophy size={15} /> {state.goatsCaptured} goats captured</span><span>{connection === 'connected' ? 'Live sync on' : 'Trying to reconnect…'}</span></div></main>{error && <button className="game-error-toast" onClick={clearError}>{error} ×</button>}{finished && <div className="game-modal-backdrop"><div className="game-modal"><span className="modal-trophy">{won ? '🎉' : '😔'}</span><p className="eyebrow">{won ? 'A beautiful finish' : 'That was a close one'}</p><h1>{won ? 'You win!' : 'You lost.'}</h1><p>{state.winnerRole === 'TIGER' ? 'The tiger captured five goats.' : state.winnerRole === 'GOATS' ? 'The goats surrounded the tiger.' : state.endReason}</p><div className="modal-stats"><span>{state.moveNumber} <small>MOVES</small></span><span>{state.goatsCaptured} <small>CAPTURES</small></span></div><button className="button button-primary" onClick={rematch} disabled={state.rematchRequests.includes(playerId)}>{state.rematchRequests.includes(playerId) ? 'Waiting for opponent…' : 'Play again'}</button><Link to="/games" className="button button-secondary">Back to games</Link></div></div>}</section>
}
