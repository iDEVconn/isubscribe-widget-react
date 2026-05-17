import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SubscriptionWidget } from '../SubscriptionWidget';
import type { Subscription } from '../types';

const PLAN: Subscription = {
  id: 'plan-1',
  title: 'Starter',
  price: {
    originalPrice: 0,
    currency: 'USD',
    duration: { period: 1, type: 'month' },
  },
};

function mockFetch(impl: () => Promise<Response>) {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function makeResponse(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: STATUS_TEXT[status] ?? '',
    headers: { 'Content-Type': 'application/json' },
  });
}

const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  401: 'Unauthorized',
  403: 'Forbidden',
  500: 'Internal Server Error',
};

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SubscriptionWidget — error rendering', () => {
  it('renders friendly invalid_key message on HTTP 401', async () => {
    mockFetch(async () => makeResponse(401));

    render(<SubscriptionWidget apiKey="bad" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Invalid API key');
    expect(alert).not.toHaveTextContent('HTTP 401');
  });

  it('renders friendly invalid_key message on HTTP 403', async () => {
    mockFetch(async () => makeResponse(403));

    render(<SubscriptionWidget apiKey="bad" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Invalid API key');
  });

  it('renders friendly unavailable message on HTTP 500', async () => {
    mockFetch(async () => makeResponse(500));

    render(<SubscriptionWidget apiKey="key" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/temporarily unavailable/i);
  });

  it('renders friendly network message when fetch rejects with TypeError', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });

    render(<SubscriptionWidget apiKey="key" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/network problem/i);
  });

  it('uses labels.errorMessages override when provided', async () => {
    mockFetch(async () => makeResponse(401));

    render(
      <SubscriptionWidget
        apiKey="bad"
        labels={{
          errorMessages: {
            invalid_key: 'Custom: bad key, sorry',
          },
        }}
      />,
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Custom: bad key, sorry');
  });

  it('falls back to default English message when override is missing the matched reason', async () => {
    mockFetch(async () => makeResponse(500));

    render(
      <SubscriptionWidget
        apiKey="key"
        labels={{
          errorMessages: {
            invalid_key: 'Only invalid_key overridden',
          },
        }}
      />,
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/temporarily unavailable/i);
  });

  it('renders nothing in the error slot when fallbackNotification is false', async () => {
    const onError = vi.fn();
    mockFetch(async () => makeResponse(401));

    const { container } = render(
      <SubscriptionWidget apiKey="bad" fallbackNotification={false} onError={onError} />,
    );

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(container.textContent).toBe('');
  });

  it('calls onError with the original Error and a classified reason', async () => {
    const onError = vi.fn();
    mockFetch(async () => makeResponse(401));

    render(<SubscriptionWidget apiKey="bad" onError={onError} />);

    await waitFor(() => expect(onError).toHaveBeenCalled());
    const [errArg, reasonArg] = onError.mock.calls[0];
    expect(errArg).toBeInstanceOf(Error);
    expect((errArg as Error).message).toContain('HTTP 401');
    expect(reasonArg).toBe('invalid_key');
  });

  it('classifies a TypeError fetch rejection as network in onError', async () => {
    const onError = vi.fn();
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });

    render(<SubscriptionWidget apiKey="key" onError={onError} />);

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0][1]).toBe('network');
  });
});

describe('SubscriptionWidget — success path', () => {
  it('renders plan cards on successful fetch', async () => {
    mockFetch(async () => makeResponse(200, [PLAN]));

    render(<SubscriptionWidget apiKey="key" />);

    expect(await screen.findByText('Starter')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
