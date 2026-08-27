import { useState } from 'react'
import { LoaderCircle, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import { getAnonymousPlayerId } from '../lib/identity'
import { ConnectionStatus } from './ConnectionStatus'
import { PlayerList } from './PlayerList'
import { RoomCode } from './RoomCode'
import { ShareButtons } from './ShareButtons'

export function WaitingRoom({ room, connection, error }) {
  const [startError, setStartError] = useState(''); const [starting, setStarting] = useState(false); const navigate = useNavigate(); const me = getAnonymousPlayerId(); const isHost = room.hostId === me; const connectedPlayers = room.players.filter((player) => player.connected).length
  async function start() { setStarting(true); setStartError(''); try { await apiRequest(`/api/rooms/${room.roomCode}/start`, { method: 'POST', body: JSON.stringify({ playerId: me }) }); navigate(`/play/${room.roomCode}`) } catch (err) { setStartError(err.message) } finally { setStarting(false) } }
  return <section className="page-width page-section waiting-page"><div className="waiting-top"><div><p className="eyebrow">Your room is ready</p><h1>Gather your<br /><em>people.</em></h1></div><ConnectionStatus state={connection} /></div>{error && <p className="form-error room-alert">{error}</p>}<div className="waiting-card"><div className="waiting-card-head"><RoomCode code={room.roomCode} /><div><span className="room-game-label">GAME</span><strong>{room.gameId === 'barah-goti' ? 'Barah Goti' : room.gameId}</strong></div></div><div className="waiting-card-body"><div className="player-heading"><h2>Players <span>{connectedPlayers}/4</span></h2><span>{connectedPlayers < 2 ? 'Waiting for another player…' : 'Ready to start'}</span></div><PlayerList players={room.players} hostId={room.hostId} />{connectedPlayers < 2 && <p className="waiting-message">Share the room link to invite a friend.</p>}<ShareButtons roomCode={room.roomCode} gameName="Barah Goti" /><div className="host-actions">{isHost && <button className="button button-primary" onClick={start} disabled={starting || connectedPlayers < 2}>{starting ? <LoaderCircle className="spin" size={16} /> : <Play size={16} />}{starting ? 'Starting…' : 'Start game'}</button>}{!isHost && <p className="host-message">The host will start the game when everyone is ready.</p>}{startError && <p className="form-error">{startError}</p>}</div></div></div></section>
}