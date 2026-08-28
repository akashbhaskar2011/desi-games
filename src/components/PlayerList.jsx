import { Crown, UserRound } from "lucide-react";

export function PlayerList({ players, hostId }) {
  return (
    <div className="player-list">
      {players.map((player) => (
        <div
          className={`player-row ${player.connected ? "" : "player-offline"}`}
          key={player.id}
        >
          <span className="player-avatar">
            <UserRound size={18} />
          </span>
          <span className="player-name">
            {player.name}
            {player.id === hostId && (
              <small>
                <Crown size={11} /> HOST
              </small>
            )}
          </span>
          <span className="player-state">
            {player.connected ? "READY" : "DISCONNECTED"}
          </span>
        </div>
      ))}
    </div>
  );
}
