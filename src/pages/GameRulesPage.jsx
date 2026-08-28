import { ArrowLeft, BookOpen, Users } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getGameRules } from "../data/gameRules";

const sectionLinks = [
  "Objective",
  "Board and starting position",
  "Turns and movement",
  "Winning and draw assumptions",
  "Multiplayer edge cases",
];

function formatBody(body) {
  return body.split("\n\n").map((paragraph, index) => {
    if (paragraph.startsWith("- "))
      return (
        <ul key={index}>
          {paragraph.split("\n").map((item) => (
            <li key={item}>{item.replace(/^- /, "")}</li>
          ))}
        </ul>
      );
    return <p key={index}>{paragraph}</p>;
  });
}

export function GameRulesPage() {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const rules = getGameRules(gameId);
  if (!rules)
    return (
      <section className="page-width page-section">
        <p className="eyebrow">Rules unavailable</p>
        <h1>Game not found.</h1>
        <Link to="/games" className="button button-secondary">
          Back to games
        </Link>
      </section>
    );
  const room = searchParams.get("room");
  const backToGame = room ? `/play/${room}` : `/games/${gameId}`;
  return (
    <section className="page-width page-section rules-page">
      <Link to={backToGame} className="back-link">
        <ArrowLeft size={15} /> Back to Game
      </Link>
      <header className="rules-page-header">
        <div>
          <p className="eyebrow">
            <BookOpen size={13} /> {rules.title}
          </p>
          <h1>
            Complete
            <br />
            <em>Rules.</em>
          </h1>
          <p>{rules.subtitle}</p>
        </div>
        <div className="rules-summary">
          <div>
            <Users size={16} />
            <span>Players</span>
            <strong>{rules.players}</strong>
          </div>
          <div>
            <span>🐯</span>
            <span>Tiger</span>
            <strong>{rules.tiger}</strong>
          </div>
          <div>
            <span>🐐</span>
            <span>Goats</span>
            <strong>{rules.goats}</strong>
          </div>
          <div>
            <span>🎯</span>
            <span>Type</span>
            <strong>{rules.type}</strong>
          </div>
        </div>
      </header>
      <div className="rules-layout">
        <aside className="rules-toc">
          <p className="eyebrow">Rules</p>
          {sectionLinks.map((heading) => (
            <a
              href={`#${heading.toLowerCase().replaceAll(" ", "-")}`}
              key={heading}
            >
              {heading}
            </a>
          ))}
        </aside>
        <article className="rules-article">
          {rules.sections.map((section, index) => (
            <section
              id={section.heading.toLowerCase().replaceAll(" ", "-")}
              className="rules-section"
              key={section.heading}
            >
              <span className="rules-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2>{section.heading}</h2>
              {formatBody(section.body)}
            </section>
          ))}
          <div className="rules-callout">
            <strong>Important</strong>
            <p>
              The server validates every move. Your local board only highlights
              possible destinations for convenience.
            </p>
          </div>
          <Link
            to={backToGame}
            className="button button-primary rules-bottom-link"
          >
            <ArrowLeft size={16} /> Back to Game
          </Link>
        </article>
      </div>
    </section>
  );
}
