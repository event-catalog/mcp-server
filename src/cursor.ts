/**
 * MCP error code for invalid cursor (Invalid params)
 */
export const INVALID_CURSOR_ERROR_CODE = -32602;

/**
 * Error thrown when cursor is invalid
 */
export class InvalidCursorError extends Error {
  readonly code = INVALID_CURSOR_ERROR_CODE;

  constructor(message = 'Invalid or malformed cursor') {
    super(message);
    this.name = 'InvalidCursorError';
  }
}

/**
 * Encode position to opaque cursor string.
 * Uses base64url for URL-safe encoding.
 */
export function encodeCursor(position: number): string {
  return Buffer.from(String(position)).toString('base64url');
}

/**
 * Decode cursor string to position.
 * Returns null if cursor is invalid.
 */
export function decodeCursor(cursor: string): number | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const position = parseInt(decoded, 10);
    return isNaN(position) || position < 0 ? null : position;
  } catch {
    return null;
  }
}

/**
 * Decode cursor string to position, throwing if invalid.
 * Use this when you want to return MCP-compliant error.
 */
export function decodeCursorOrThrow(cursor: string): number {
  const position = decodeCursor(cursor);
  if (position === null) {
    throw new InvalidCursorError();
  }
  return position;
}
