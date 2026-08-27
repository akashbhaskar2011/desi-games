import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { JoinRoomForm } from '../components/JoinRoomForm'

export function JoinRoom() { const { roomCode } = useParams(); const code = roomCode?.toUpperCase(); return <section className="page-width page-section form-page"><Link to="/games" className="back-link"><ArrowLeft size={15} /> Browse games</Link><div className="form-card"><p className="eyebrow">Join room</p><h1>You’re<br /><em>invited.</em></h1><p>Enter your name and you’re in. No account, no fuss.</p><JoinRoomForm roomCode={code} /></div></section> }