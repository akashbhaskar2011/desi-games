import { motion } from 'framer-motion'
import { GameCard } from './GameCard'

export function GameGrid({ games }) {
  return <div className="game-grid">{games.map((game, index) => <motion.div key={game.slug} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: index * .04 }}><GameCard game={game} /></motion.div>)}</div>
}