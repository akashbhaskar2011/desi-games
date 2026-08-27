const isProduction = process.env.NODE_ENV === 'production'

export const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || process.env.SERVER_PORT || 3001),
  databaseUrl: process.env.DATABASE_URL || '',
  clientUrl: process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  corsOrigins: (process.env.CORS_ORIGIN || process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean),
  isProduction,
  roomTtlMs: 6 * 60 * 60 * 1000,
})

if (isProduction && !config.databaseUrl) throw new Error('DATABASE_URL is required in production')