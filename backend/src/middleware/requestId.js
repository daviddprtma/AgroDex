import { randomUUID } from 'crypto';

/**
 * Middleware that assigns a unique request ID to every incoming request.
 *
 * - If the client sends an X-Request-ID header, it is reused (useful for
 *   distributed tracing where the ID originates from a gateway or frontend).
 * - Otherwise a new UUID v4 is generated.
 * - The ID is attached to `req.id` and echoed in the X-Request-ID response
 *   header so clients can reference it when reporting issues.
 */
export function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || randomUUID();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
}
