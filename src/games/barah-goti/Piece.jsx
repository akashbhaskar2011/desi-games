import { motion } from "framer-motion";

export function Piece({ type, selected, movable, own, onClick }) {
  return (
    <motion.button
      type="button"
      className={`piece piece-${type.toLowerCase()} ${selected ? "piece-selected" : ""} ${movable ? "piece-movable" : ""} ${own ? "piece-own" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={`${type === "TIGER" ? "Tiger" : "Goat"} piece`}
      animate={{ scale: selected ? 1.1 : 1 }}
      transition={{ duration: 0.15 }}
    >
      <span>{type === "TIGER" ? "🐯" : "🐐"}</span>
    </motion.button>
  );
}
