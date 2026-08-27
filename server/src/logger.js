function write(level, message, context = {}) {
  process.stdout.write(`${JSON.stringify({ level, message, time: new Date().toISOString(), ...context })}\n`)
}

export const logger = Object.freeze({
  info: (message, context) => write('info', message, context),
  warn: (message, context) => write('warn', message, context),
  error: (message, context) => write('error', message, context),
})