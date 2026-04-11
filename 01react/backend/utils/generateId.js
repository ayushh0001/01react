import { randomUUID } from 'crypto';

/**
 * Generates a RFC 4122 UUID v4.
 * Compatible with PostgreSQL UUID columns.
 */
export function generateId() {
  return randomUUID();
}
