import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const command = process.argv[2]
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for migrations')
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto')
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())')
  const files = (await fs.readdir(path.join(__dirname, 'migrations'))).filter((file) => file.endsWith('.sql')).sort()
  if (command === 'up') {
    for (const file of files) {
      const applied = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file])
      if (!applied.rowCount) { await pool.query(await fs.readFile(path.join(__dirname, 'migrations', file), 'utf8')); await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]); console.log(`Applied ${file}`) }
    }
  } else if (command === 'down') {
    const last = await pool.query('SELECT name FROM schema_migrations ORDER BY applied_at DESC LIMIT 1')
    if (last.rowCount) { await pool.query('DROP TABLE IF EXISTS game_moves, game_sessions, room_players, rooms, games, players CASCADE'); await pool.query('DELETE FROM schema_migrations WHERE name = $1', [last.rows[0].name]); console.log(`Rolled back ${last.rows[0].name}`) }
  } else if (command === 'create') console.log('Create a numbered SQL file in server/src/db/migrations/')
  else throw new Error('Use migration:create, migration:run, or migration:rollback')
}

run().catch((error) => { console.error(error.message); process.exitCode = 1 }).finally(() => pool.end())