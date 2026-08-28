export const BOARD_SIZE = 5;
export const BOARD_NODES = Array.from({ length: 25 }, (_, id) => ({
  id,
  row: Math.floor(id / BOARD_SIZE),
  col: id % BOARD_SIZE,
}));
export const BOARD_EDGES = BOARD_NODES.flatMap(({ id, row, col }) =>
  BOARD_NODES.filter(
    (node) =>
      node.id > id &&
      Math.abs(node.row - row) <= 1 &&
      Math.abs(node.col - col) <= 1 &&
      (node.row !== row || node.col !== col),
  ).map((node) => [id, node.id]),
);
