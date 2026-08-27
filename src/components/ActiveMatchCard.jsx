import { ArrowRight, Gamepad2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getGame } from '../data/games'
import { useActiveMatch } from '../hooks/useActiveMatch'
import { StopMatchControl } from './StopMatchControl'

export function ActiveMatchCard() {
  const { match } = useActiveMatch()
  if (!match) return null
  const game = getGame(match.gameId)
  const opponent = match.players?.find((player) => player.id !== match.playerId)
  const recent = match.status === 'finished'
  return <section className={`active-match-card ${recent ? 'active-match-recent' : ''}`}><div className="active-card-icon"><Gamepad2 size={22} /></div><div><p className="eyebrow">{recent ? 'Recent match' : 'Continue your match'}</p><h2>{game?.name || match.gameId}</h2><p>Room <strong>{match.roomCode}</strong>{opponent ? <> · Your opponent: <strong>{opponent.name}</strong></> : ''}</p></div><div className="active-card-actions"><Link to={`/play/${match.roomCode}`} className="button button-primary">{recent ? 'View result' : 'Continue match'} <ArrowRight size={16} /></Link><StopMatchControl roomCode={match.roomCode} playerId={match.playerId} /></div></section>
}
