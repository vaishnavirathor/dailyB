/**
 * Structured logger — wraps console with level, service name, and
 * structured context. Swap in a real telemetry SDK later (e.g. OpenTelemetry).
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  service: string;
  msg: string;
  ts: string;
  err?: { code?: string; stack?: string };
  [key: string]: unknown;
}

const service = 'daily-bread-api';

function log(level: LogLevel, msg: string, ctx?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    service,
    msg,
    ts: new Date().toISOString(),
    ...ctx,
  };

  if (ctx?.err instanceof Error) {
    const e = ctx.err as Error & { code?: string };
    entry.err = { code: e.code, stack: e.stack };
    entry.msg = `${msg}: ${e.message}`;
    delete entry.err;
  }

  const line = JSON.stringify(entry);
  switch (level) {
    case 'error':
      console.error(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
};
