import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CircleHelp } from 'lucide-react'
import { GameHero } from '../components/GameHero'
import { BoardPreview } from '../components/BoardPreview'
import { GameGrid } from '../components/GameGrid'
import { games, getGame } from '../data/games'
import { NotFound } from './NotFound'

export function GameDetails() {
  const { slug } = useParams()
  const game = getGame(slug)
  if (!game) return <NotFound />
  const related = games.filter((item) => item.slug !== game.slug).slice(0, 3)
  return <section className="page-width page-section detail-page"><Link to="/games" className="back-link"><ArrowLeft size={15} /> All games</Link><GameHero game={game} /><div className="detail-content"><div><p className="eyebrow">The lowdown</p><h2>How it works</h2><p className="detail-how">{game.howItWorks || `${game.name} is coming to your screen soon. We are carefully bringing its familiar rhythm online while keeping the spirit of the original intact.`}</p></div>{game.playable ? <BoardPreview /> : <div className="coming-panel"><CircleHelp size={24} /><h3>We are getting the board ready.</h3><p>This game is in the works. Check back soon for a new way to play.</p></div>}</div><div className="related"><div className="section-heading"><div><p className="eyebrow">Keep exploring</p><h2>More to discover</h2></div></div><GameGrid games={related} /></div></section>
}