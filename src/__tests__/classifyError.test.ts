import { describe, it, expect } from 'vitest';
import { classifyError } from '../classifyError';

describe('classifyError', () => {
  describe('invalid_key', () => {
    it('returns invalid_key for HTTP 401', () => {
      expect(classifyError(401, new Error('HTTP 401: Unauthorized'))).toBe('invalid_key');
    });

    it('returns invalid_key for HTTP 403', () => {
      expect(classifyError(403, new Error('HTTP 403: Forbidden'))).toBe('invalid_key');
    });
  });

  describe('unavailable', () => {
    it('returns unavailable for HTTP 500', () => {
      expect(classifyError(500, new Error('HTTP 500: Internal Server Error'))).toBe('unavailable');
    });

    it('returns unavailable for HTTP 502', () => {
      expect(classifyError(502, new Error('HTTP 502: Bad Gateway'))).toBe('unavailable');
    });

    it('returns unavailable for HTTP 503', () => {
      expect(classifyError(503, new Error('HTTP 503: Service Unavailable'))).toBe('unavailable');
    });

    it('returns unavailable for HTTP 504', () => {
      expect(classifyError(504, new Error('HTTP 504: Gateway Timeout'))).toBe('unavailable');
    });
  });

  describe('network', () => {
    it('returns network when status is null and error is a TypeError (fetch reject)', () => {
      const err = new TypeError('Failed to fetch');
      expect(classifyError(null, err)).toBe('network');
    });

    it('returns network when status is null and message mentions network', () => {
      const err = new Error('NetworkError when attempting to fetch resource');
      expect(classifyError(null, err)).toBe('network');
    });

    it('returns network when status is null and message mentions fetch', () => {
      const err = new Error('fetch aborted');
      expect(classifyError(null, err)).toBe('network');
    });
  });

  describe('unknown', () => {
    it('returns unknown for HTTP 400 (client error not 401/403)', () => {
      expect(classifyError(400, new Error('HTTP 400: Bad Request'))).toBe('unknown');
    });

    it('returns unknown for HTTP 404', () => {
      expect(classifyError(404, new Error('HTTP 404: Not Found'))).toBe('unknown');
    });

    it('returns unknown for HTTP 429', () => {
      expect(classifyError(429, new Error('HTTP 429: Too Many Requests'))).toBe('unknown');
    });

    it('returns unknown when status is null and error is a plain Error without network hints', () => {
      expect(classifyError(null, new Error('Something exploded'))).toBe('unknown');
    });
  });
});
