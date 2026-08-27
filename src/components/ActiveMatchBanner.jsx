import { ArrowRight, Gamepad2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getGame } from '../data/games'
import { useActiveMatch } from '../hooks/useActiveMatch'
import { StopMatchControl } from './StopMatchControl'
import { isViewingMatch } from '../services/activeMatch'

export function ActiveMatchBanner() {
  const { match } = useActiveMatch(); const location = useLocation()
  if (!match || isViewingMatch(location.pathname, match.roomCode)) return null
  const game = getGame(match.gameId); const recent = match.status === 'finished'
  return <aside className="active-match-banner"><div className="active-match-icon"><Gamepad2 size={20} /></div><div><span>{recent ? 'Recent match' : 'Active match'}</span><strong>{game?.name || match.gameId} · {match.roomCode}</strong></div><div className="active-match-actions"><Link to={`/play/${match.roomCode}`} className="button button-primary">{recent ? 'View result' : 'Continue match'} <ArrowRight size={15} /></Link><StopMatchControl roomCode={match.roomCode} playerId={match.playerId} /></div></aside>
}
