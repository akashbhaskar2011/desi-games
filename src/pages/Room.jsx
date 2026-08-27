import { Link, useParams } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { useRoom } from '../hooks/useRoom'
import { WaitingRoom } from '../components/WaitingRoom'

export function Room() { const { roomCode } = useParams(); const state = useRoom(roomCode.toUpperCase()); if (!state.room) return <section className="page-width loading-page"><LoaderCircle className="spin" size={28} /><p>{state.error || 'Joining room…'}</p>{state.error && <Link to="/games" className="text-link">Browse games</Link>}</section>; return <WaitingRoom {...state} /> }