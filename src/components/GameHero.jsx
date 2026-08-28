import { Badge } from "./Badge";
import { Button } from "./Button";
import { Users } from "lucide-react";

export function GameHero({ game }) {
  return (
    <section className={`detail-hero accent-${game.accent}`}>
      <div className="detail-hero-copy">
        <Badge tone={game.playable ? "live" : "default"}>
          {game.playable ? "Playable now" : "Coming soon"}
        </Badge>
        <h1>{game.name}</h1>
        {game.alternateName && (
          <p className="detail-alternate">Also known as {game.alternateName}</p>
        )}
        <p className="detail-description">{game.description}</p>
        <span className="player-count">
          <Users size={16} /> {game.players}
        </span>
        <Button
          to={game.playable ? `/create/${game.slug}` : undefined}
          disabled={!game.playable}
        >
          {game.playable ? "Create room" : "Coming soon"}
        </Button>
      </div>
      <div className="detail-hero-art">
        <span>{game.icon}</span>
        <small>{game.category} / 01</small>
      </div>
    </section>
  );
}
