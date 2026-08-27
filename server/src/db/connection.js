import pg from 'pg'
import { config } from '../config.js'

export const pool = config.databaseUrl ? new pg.Pool({ connectionString: config.databaseUrl, max: 10, idleTimeoutMillis: 30000 }) : null

export async function checkDatabase() {
  if (!pool) return { configured: false, connected: false }
  await pool.query('SELECT 1')
  return { configured: true, connected: true }
}