import type { ISubscribeErrorReason } from './types';

/**
 * Maps a fetch outcome to a high-level reason so the widget (and consumers)
 * can render friendly, branchable messages instead of raw `HTTP 401: …` text.
 *
 * - `status` is the HTTP status code, or `null` if the request never produced
 *   a response (network error, CORS rejection, timeout, etc.).
 * - `err` is the thrown error — used to distinguish a network failure (typically
 *   `TypeError` from `fetch`) from an unknown application error.
 */
export function classifyError(status: number | null, err: Error): ISubscribeErrorReason {
  if (status === 401 || status === 403) return 'invalid_key';
  if (status !== null && status >= 500) return 'unavailable';
  if (status === null) {
    if (err.name === 'TypeError' || /network|fetch|failed to fetch/i.test(err.message)) {
      return 'network';
    }
    return 'unknown';
  }
  return 'unknown';
}
