import { motion } from "framer-motion";
import { ArrowDown, Link2, Smartphone, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { GameGrid } from "../components/GameGrid";
import { games } from "../data/games";
import { ActiveMatchCard } from "../components/ActiveMatchCard";

export function Home() {
  return (
    <>
      <ActiveMatchCard />
      <section className="home-hero page-width">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> A new home for old favourites
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Khel wahi,
            <br />
            <em>dost naye.</em>
          </motion.h1>
          <p className="hero-subtitle">
            The games you grew up with, ready for a new generation of players.
            Gather your people and make a room.
          </p>
          <div className="hero-actions">
            <Button to="/games/barah-goti">Play now</Button>
            <Button to="/games" variant="secondary">
              Explore games
            </Button>
          </div>
        </div>
        <div className="hero-board">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-token token-one">♛</div>
          <div className="hero-token token-two">●</div>
          <div className="hero-token token-three">●</div>
          <div className="hero-board-lines" />
          <span className="hero-side-note">PLAY / CONNECT / REPEAT</span>
        </div>
        <a className="scroll-hint" href="#popular">
          <ArrowDown size={15} /> Scroll to explore
        </a>
      </section>
      <section className="trust-strip">
        <div className="page-width trust-items">
          <span>10 iconic games</span>
          <span>Made for India</span>
          <span>Zero fuss, just play</span>
        </div>
      </section>
      <section className="section page-width" id="popular">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / The good stuff</p>
            <h2>Popular games</h2>
          </div>
          <Link to="/games" className="text-link">
            See all games <span>↗</span>
          </Link>
        </div>
        <GameGrid games={games.slice(0, 4)} />
      </section>
      <section className="feature-band">
        <div className="page-width">
          <p className="eyebrow">02 / Your kind of easy</p>
          <h2>
            Less setup.
            <br />
            <em>More play.</em>
          </h2>
          <div className="feature-grid">
            <div>
              <UserRound />
              <h3>No login required</h3>
              <p>Jump straight in. Your name and a room is all you need.</p>
            </div>
            <div>
              <Link2 />
              <h3>Share with friends</h3>
              <p>Send a link to your group and start the good-natured chaos.</p>
            </div>
            <div>
              <Smartphone />
              <h3>Play on mobile</h3>
              <p>
                Built for the kitchen table, the train, and everywhere between.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
