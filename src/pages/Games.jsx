import { useState } from "react";
import { GameGrid } from "../components/GameGrid";
import { games } from "../data/games";
import { ActiveMatchCard } from "../components/ActiveMatchCard";

export function Games() {
  const [filter, setFilter] = useState("All games");
  const filters = ["All games", "Playable now", "Coming soon"];
  const shown = games.filter(
    (game) =>
      filter === "All games" ||
      (filter === "Playable now" ? game.playable : !game.playable),
  );
  return (
    <section className="page-width page-section">
      <ActiveMatchCard />
      <div className="page-intro">
        <p className="eyebrow">The catalogue / 2026</p>
        <h1>
          Find your next
          <br />
          <em>favourite.</em>
        </h1>
        <p>
          Ten timeless games, gathered in one place. Start with a classic or
          discover something new.
        </p>
      </div>
      <div className="filter-row">
        {filters.map((item) => (
          <button
            key={item}
            className={filter === item ? "filter-active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
        <span>{shown.length} games</span>
      </div>
      <GameGrid games={shown} />
    </section>
  );
}
