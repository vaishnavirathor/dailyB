/**
 * Structured application errors — every error that crosses the
 * HTTP boundary uses one of these.
 */

export type ErrorCode =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL'
  | 'RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'EMAIL_EXISTS';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(entity: string, id?: string): AppError {
  const msg = id ? `${entity} not found: ${id}` : `${entity} not found`;
  return new AppError('NOT_FOUND', msg, 404);
}

export function unauthorized(msg = 'unauthorized'): AppError {
  return new AppError('UNAUTHORIZED', msg, 401);
}

export function forbidden(msg = 'forbidden'): AppError {
  return new AppError('FORBIDDEN', msg, 403);
}

export function validationError(details: Record<string, unknown>): AppError {
  return new AppError('VALIDATION_ERROR', 'validation failed', 400, details);
}

export function conflict(msg: string): AppError {
  return new AppError('CONFLICT', msg, 409);
}

export function internal(msg = 'internal error'): AppError {
  return new AppError('INTERNAL', msg, 500);
}
