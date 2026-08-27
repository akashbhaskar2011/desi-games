import { Link, NavLink } from 'react-router-dom'
import { Gamepad2, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useActiveMatch } from '../hooks/useActiveMatch'
import { getGame } from '../data/games'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { match } = useActiveMatch()
  const activeGame = match && getGame(match.gameId)
  const links = [['Games', '/games'], ['How to play', '/how-to-play']]
  return <header className="site-nav">
    <div className="nav-inner">
      <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark"><Gamepad2 size={18} /></span><span>desi<span className="brand-accent">games</span></span></Link>
      <nav className={`nav-links ${open ? 'nav-links-open' : ''}`} aria-label="Main navigation">
        {links.map(([label, to]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}
        {match && <NavLink className="nav-continue" to={`/play/${match.roomCode}`} onClick={() => setOpen(false)}>🎮 Continue Match{activeGame ? ` · ${activeGame.name}` : ''}</NavLink>}
        <Link className="nav-play" to="/games/barah-goti" onClick={() => setOpen(false)}>Play Barah Goti <span>↗</span></Link>
      </nav>
      <button className="menu-button" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
  </header>
}