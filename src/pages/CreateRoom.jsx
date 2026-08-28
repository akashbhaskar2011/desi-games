import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CreateRoomForm } from "../components/CreateRoomForm";
import { getGame } from "../data/games";
import { NotFound } from "./NotFound";

export function CreateRoom() {
  const game = getGame(useParams().gameId);
  if (!game || !game.playable) return <NotFound />;
  return (
    <section className="page-width page-section form-page">
      <Link to={`/games/${game.slug}`} className="back-link">
        <ArrowLeft size={15} /> Back to game
      </Link>
      <div className="form-card">
        <p className="eyebrow">Create a room</p>
        <h1>
          Ready when
          <br />
          <em>you are.</em>
        </h1>
        <p>Pick a name your friends will recognize. No login required.</p>
        <CreateRoomForm game={game} />
      </div>
    </section>
  );
}
