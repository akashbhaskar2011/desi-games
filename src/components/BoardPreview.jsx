export function BoardPreview() {
  return (
    <div
      className="board-preview"
      aria-label="Decorative Barah Goti board preview"
    >
      <div className="board-grid">
        {Array.from({ length: 25 }, (_, i) => (
          <span
            key={i}
            className={
              i === 12
                ? "board-tiger"
                : [2, 6, 8, 16, 18, 22].includes(i)
                  ? "board-goat"
                  : ""
            }
          >
            {i === 12 ? "♛" : [2, 6, 8, 16, 18, 22].includes(i) ? "●" : ""}
          </span>
        ))}
      </div>
      <div className="board-caption">
        <span>BARAH GOTI</span>
        <span>BOARD PREVIEW</span>
      </div>
    </div>
  );
}
