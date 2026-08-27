# Barah Goti / Bagh-Bakri: MVP ruleset

This project uses one deliberately defined MVP ruleset. Regional Barah Goti and Bagh-Bakri boards vary, so this is an implementation contract rather than a claim that every region plays identically.

## Objective

One player controls the tiger and one player controls twelve goats. The tiger tries to capture goats. The goats try to surround the tiger so it has no legal move.

## Board and starting position

The board is a 5x5 square graph with 25 nodes. Every node connects to its horizontal, vertical, and diagonal neighbors. The tiger starts at the centre node (node 12). Twelve goats start in nodes 0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, and 14. The remaining nodes are empty.

## Turns and movement

The tiger moves first. Players alternate turns.

- A goat moves one step to any connected empty node.
- The tiger moves one step to any connected empty node.
- The tiger may capture by jumping over one adjacent goat to the empty node immediately beyond it in the same direction. The jumped goat is removed.
- A move must stay on the 5x5 board and follow an edge or a valid two-edge capture line.

## Winning and draw assumptions

- The tiger wins after capturing five goats.
- The goats win when the tiger has no legal moves.
- The MVP has no draw rule. A 200-move safety limit ends the session as a draw for future-proofing.

## Multiplayer edge cases

- A disconnected player remains in the room and their game position is preserved. The player can reconnect with the same anonymous player ID.
- A rematch is available after the game ends only when both players accept. The same room is reused and the board, turn, captures, and move history reset for the new game.
- Moves from a non-member, moves during the other player's turn, occupied destinations, and moves after the game ends are rejected by the server.

The server calculates legal moves, captures, turns, and results. Client-side move hints are only visual assistance.