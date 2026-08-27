import { useState } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import { getAnonymousPlayerId } from '../lib/identity'
import { saveActiveMatch } from '../services/activeMatch'

export function CreateRoomForm({ game }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  async function submit(event) { event.preventDefault(); setError(''); setLoading(true); try { const playerId = getAnonymousPlayerId(); const playerName = name.trim(); const data = await apiRequest('/api/rooms', { method: 'POST', body: JSON.stringify({ gameId: game.slug, playerId, name: playerName }) }); saveActiveMatch({ roomCode: data.roomCode, gameId: game.slug, playerId, playerName }); navigate(`/room/${data.roomCode}`) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  return <form className="room-form" onSubmit={submit}><label htmlFor="create-name">Your name</label><input id="create-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={20} placeholder="How should friends call you?" autoFocus required /><small>{name.length}/20 characters</small>{error && <p className="form-error">{error}</p>}<button className="button button-primary" disabled={loading}>{loading ? <LoaderCircle className="spin" size={16} /> : <ArrowRight size={16} />}{loading ? 'Creating room…' : 'Create room'}</button></form>
}