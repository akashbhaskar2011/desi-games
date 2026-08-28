import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SERVER_URL } from "../lib/api";
import { getAnonymousPlayerId } from "../lib/identity";
import {
  clearActiveMatchForRoom,
  getActiveMatch,
  updateActiveMatch,
} from "../services/activeMatch";

export function useRoom(roomCode) {
  const [room, setRoom] = useState(null);
  const [connection, setConnection] = useState("connecting");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!roomCode) return undefined;
    const socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    const playerId = getAnonymousPlayerId();
    const updateCurrentRoom = (patch) => {
      if (getActiveMatch()?.roomCode === roomCode) updateActiveMatch(patch);
    };
    socket.on("connect", () => {
      setConnection("connected");
      updateCurrentRoom({ roomStatus: "WAITING" });
      socket.emit("room:join", { roomCode, playerId });
    });
    socket.on("disconnect", () => setConnection("reconnecting"));
    socket.on("connect_error", () => {
      setConnection("reconnecting");
      setError("Connection lost. Reconnecting…");
    });
    socket.on("room:update", (nextRoom) => {
      setRoom(nextRoom);
      updateCurrentRoom({
        gameId: nextRoom.gameId,
        players: nextRoom.players,
        roomStatus: nextRoom.status,
      });
    });
    socket.on("room:error", (payload) => {
      if (payload.code === "ROOM_NOT_FOUND") clearActiveMatchForRoom(roomCode);
      setError(payload.message || "Unable to enter this room.");
    });
    socket.on("game:started", () => {
      window.location.assign(`/play/${roomCode}`);
    });
    return () => socket.disconnect();
  }, [roomCode]);
  return { room, connection, error };
}
