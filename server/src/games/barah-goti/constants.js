export const BOARD_SIZE = 5
export const NODE_COUNT = BOARD_SIZE * BOARD_SIZE
export const TIGER_START = 12
export const GOAT_START = [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14]
export const TIGER_CAPTURE_TARGET = 5
export const MOVE_LIMIT = 200

export const BOARD_NODES = Array.from({ length: NODE_COUNT }, (_, id) => ({ id, row: Math.floor(id / BOARD_SIZE), col: id % BOARD_SIZE }))

export const BOARD_EDGES = BOARD_NODES.flatMap(({ id, row, col }) => BOARD_NODES.filter((node) => node.id > id && Math.abs(node.row - row) <= 1 && Math.abs(node.col - col) <= 1 && (node.row !== row || node.col !== col)).map((node) => [id, node.id]))

export const BOARD_ADJACENCY = BOARD_NODES.reduce((adjacency, node) => {
  adjacency[node.id] = BOARD_NODES.filter((candidate) => Math.abs(candidate.row - node.row) <= 1 && Math.abs(candidate.col - node.col) <= 1 && candidate.id !== node.id).map((candidate) => candidate.id)
  return adjacency
}, {})