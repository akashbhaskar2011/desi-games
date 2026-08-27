import { useEffect, useState } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import { getAnonymousPlayerId } from '../lib/identity'
import { getActiveMatch, saveActiveMatch } from '../services/activeMatch'

export function JoinRoomForm({ roomCode }) {
  const [name, setName] = useState(''); const [room, setRoom] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const navigate = useNavigate()
  useEffect(() => { setRoom(null); setError(''); apiRequest(`/api/rooms/${roomCode}`).then(setRoom).catch((error) => setError(error.status === 404 ? 'Room not found or expired.' : error.message)) }, [roomCode])
  const active = getActiveMatch(); const playerId = getAnonymousPlayerId(); const alreadyHere = Boolean(room?.players.some((player) => player.id === playerId) && active?.roomCode === roomCode && active?.playerId === playerId)
  function continueMatch() { navigate(room.status === 'PLAYING' ? `/play/${roomCode}` : `/room/${roomCode}`) }
  async function submit(event) { event.preventDefault(); setError(''); setLoading(true); try { const playerId = getAnonymousPlayerId(); const playerName = name.trim(); const joined = await apiRequest(`/api/rooms/${roomCode}/join`, { method: 'POST', body: JSON.stringify({ playerId, name: playerName }) }); saveActiveMatch({ roomCode, gameId: joined.gameId, playerId, playerName }); navigate(`/room/${roomCode}`) } catch (err) { setError(err.code === 'ROOM_FULL' ? 'Room is full.' : err.message) } finally { setLoading(false) } }
  return <form className="room-form" onSubmit={submit}><p className="join-room-label">ROOM: <strong>{roomCode}</strong></p>{room && <p className="join-game-name">Joining {room.gameId === 'barah-goti' ? 'Barah Goti' : room.gameId}</p>}{alreadyHere ? <div className="already-member"><strong>You are already in this match.</strong><button type="button" className="button button-primary" onClick={continueMatch}>Continue match <ArrowRight size={16} /></button><button type="button" className="button button-secondary" onClick={() => { localStorage.setItem('desi-games-anonymous-player-id', crypto.randomUUID()); setName('') }}>Join as another player</button></div> : <><label htmlFor="join-name">Your name</label><input id="join-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={20} placeholder="Enter your name" autoFocus required disabled={!room} />{error && <p className="form-error">{error}</p>}<button className="button button-primary" disabled={loading || !room}>{loading ? <LoaderCircle className="spin" size={16} /> : <ArrowRight size={16} />}{loading ? 'Joining…' : 'Join game'}</button></>}</form>
}