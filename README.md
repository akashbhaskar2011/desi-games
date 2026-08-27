# Desi Games

Desi Games is a multiplayer platform for traditional Indian games. The current playable game is Barah Goti / Bagh-Bakri.

## Local development

1. Install dependencies with `npm install`.
2. Start PostgreSQL with `docker compose up -d postgres`, or use an existing PostgreSQL instance.
3. Copy `.env.example` to `.env` and set `DATABASE_URL`. The Docker development URL is `postgresql://desi_games:desi_games_dev@localhost:5432/desi_games`.
4. Run `npm run migration:run`.
5. Start the API with `npm run server`.
6. Start Vite in another terminal with `npm run dev`.

Without `DATABASE_URL` in development, the existing in-memory adapter remains available for UI and rules work. Production refuses to start without PostgreSQL.

## Database commands

- `npm run migration:create`
- `npm run migration:run`
- `npm run migration:rollback`

## Verification

- `npm test` runs room, game, socket, repository, and active-match tests.
- `npm run build` creates the production frontend bundle.
