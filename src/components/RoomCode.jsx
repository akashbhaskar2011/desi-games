import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function RoomCode({ code }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return (
    <div className="room-code">
      <span>ROOM CODE</span>
      <strong>{code}</strong>
      <button onClick={copy} aria-label="Copy room code">
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}
