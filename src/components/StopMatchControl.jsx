import { useState } from "react";
import { clearActiveMatchForRoom } from "../services/activeMatch";
import { apiRequest } from "../lib/api";

export function StopMatchControl({ className = "", roomCode, playerId }) {
  const [open, setOpen] = useState(false);
  async function stop() {
    if (roomCode && playerId) {
      await apiRequest(`/api/rooms/${roomCode}/terminate`, {
        method: "POST",
        body: JSON.stringify({ playerId, reason: "match_stopped" }),
      });
      clearActiveMatchForRoom(roomCode);
    }
    setOpen(false);
  }
  return (
    <>
      <button
        className={`stop-match-button ${className}`}
        onClick={() => setOpen(true)}
      >
        Stop Match
      </button>
      {open && (
        <div className="stop-modal-backdrop" role="presentation">
          <div
            className="stop-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stop-match-title"
          >
            <p className="eyebrow">Active match</p>
            <h2 id="stop-match-title">Stop this match?</h2>
            <p>
              You will no longer see this match as an active match on this
              device.
            </p>
            <div className="stop-modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button className="button button-danger" onClick={stop}>
                Stop Match
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
