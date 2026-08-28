import { Users, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./Badge";

export function GameCard({ game, featured = false }) {
  return (
    <article
      className={`game-card ${featured ? "game-card-featured" : ""} accent-${game.accent}`}
    >
      <Link
        to={`/games/${game.slug}`}
        className="game-card-link"
        aria-label={`View ${game.name}`}
      >
        <div className="game-art">
          <span className="game-symbol">{game.icon}</span>
          <span className="art-label">
            DESI / {game.category.toUpperCase()}
          </span>
          <ArrowUpRight className="art-arrow" size={20} />
        </div>
        <div className="game-card-body">
          <div className="card-heading">
            <div>
              <h3>{game.name}</h3>
              {game.alternateName && (
                <span className="alternate-name">{game.alternateName}</span>
              )}
            </div>
            {game.playable ? (
              <Badge tone="live">Playable</Badge>
            ) : (
              <Badge>Coming soon</Badge>
            )}
          </div>
          <p>{game.description}</p>
          <div className="card-meta">
            <span>
              <Users size={14} /> {game.players}
            </span>
            <span className="card-view">
              View game <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
