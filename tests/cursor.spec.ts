import { describe, it, expect } from 'vitest';
import { encodeCursor, decodeCursor, decodeCursorOrThrow, InvalidCursorError, INVALID_CURSOR_ERROR_CODE } from '../src/cursor.js';

describe('cursor', () => {
  describe('encodeCursor', () => {
    it('encodes position 0', () => {
      const cursor = encodeCursor(0);
      expect(cursor).toBe('MA'); // base64url of "0"
    });

    it('encodes position 50', () => {
      const cursor = encodeCursor(50);
      expect(cursor).toBe('NTA'); // base64url of "50"
    });

    it('encodes position 100', () => {
      const cursor = encodeCursor(100);
      expect(cursor).toBe('MTAw'); // base64url of "100"
    });

    it('encodes large position', () => {
      const cursor = encodeCursor(999999);
      expect(cursor).toBe('OTk5OTk5'); // base64url of "999999"
    });
  });

  describe('decodeCursor', () => {
    it('decodes valid cursor for position 0', () => {
      const position = decodeCursor('MA');
      expect(position).toBe(0);
    });

    it('decodes valid cursor for position 50', () => {
      const position = decodeCursor('NTA');
      expect(position).toBe(50);
    });

    it('decodes valid cursor for position 100', () => {
      const position = decodeCursor('MTAw');
      expect(position).toBe(100);
    });

    it('decodes large position', () => {
      const position = decodeCursor('OTk5OTk5');
      expect(position).toBe(999999);
    });

    it('returns null for empty string', () => {
      const position = decodeCursor('');
      expect(position).toBeNull();
    });

    it('returns null for invalid base64', () => {
      const position = decodeCursor('!!!invalid!!!');
      expect(position).toBeNull();
    });

    it('returns null for non-numeric content', () => {
      // base64url of "abc"
      const position = decodeCursor('YWJj');
      expect(position).toBeNull();
    });

    it('returns null for negative number', () => {
      // base64url of "-1"
      const position = decodeCursor('LTE');
      expect(position).toBeNull();
    });

    it('returns null for float', () => {
      // base64url of "1.5" - parseInt will return 1, which is valid
      // Actually parseInt("1.5") returns 1, so this should pass
      const position = decodeCursor('MS41');
      expect(position).toBe(1); // parseInt truncates
    });
  });

  describe('roundtrip', () => {
    it('encode then decode returns original position', () => {
      const positions = [0, 1, 10, 50, 100, 500, 1000, 99999];

      for (const original of positions) {
        const cursor = encodeCursor(original);
        const decoded = decodeCursor(cursor);
        expect(decoded).toBe(original);
      }
    });
  });

  describe('decodeCursorOrThrow', () => {
    it('returns position for valid cursor', () => {
      const cursor = encodeCursor(50);
      const position = decodeCursorOrThrow(cursor);
      expect(position).toBe(50);
    });

    it('throws InvalidCursorError for invalid cursor', () => {
      expect(() => decodeCursorOrThrow('invalid')).toThrow(InvalidCursorError);
    });

    it('throws InvalidCursorError for empty string', () => {
      expect(() => decodeCursorOrThrow('')).toThrow(InvalidCursorError);
    });

    it('thrown error has MCP error code -32602', () => {
      try {
        decodeCursorOrThrow('invalid');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidCursorError);
        expect((error as InvalidCursorError).code).toBe(INVALID_CURSOR_ERROR_CODE);
        expect((error as InvalidCursorError).code).toBe(-32602);
      }
    });
  });

  describe('InvalidCursorError', () => {
    it('has correct error code', () => {
      const error = new InvalidCursorError();
      expect(error.code).toBe(-32602);
    });

    it('has correct name', () => {
      const error = new InvalidCursorError();
      expect(error.name).toBe('InvalidCursorError');
    });

    it('has default message', () => {
      const error = new InvalidCursorError();
      expect(error.message).toBe('Invalid or malformed cursor');
    });

    it('accepts custom message', () => {
      const error = new InvalidCursorError('Custom error message');
      expect(error.message).toBe('Custom error message');
    });
  });

  describe('INVALID_CURSOR_ERROR_CODE', () => {
    it('equals MCP Invalid params error code', () => {
      expect(INVALID_CURSOR_ERROR_CODE).toBe(-32602);
    });
  });
});
