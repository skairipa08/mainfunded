import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// db modülünü tamamen mock'la — gerçek Postgres'e değmiyoruz.
const queryMock = vi.fn();
vi.mock('../lib/db', () => ({
  pool: { end: vi.fn() },
  query: (...args: any[]) => queryMock(...args),
}));

// axios mock
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    default: { post: vi.fn() },
    AxiosError: actual.AxiosError,
  };
});

import axios from 'axios';
import { enqueueDelivery, processDueDeliveries } from '../services/webhookSender';
import { verify } from '../lib/hmac';

beforeEach(() => {
  queryMock.mockReset();
  (axios.post as any).mockReset();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('enqueueDelivery', () => {
  it('does nothing when no endpoints subscribe', async () => {
    queryMock.mockResolvedValueOnce([]); // SELECT endpoints
    await enqueueDelivery({
      schoolId: 's1',
      event: 'donation.created',
      data: {},
      environment: 'live',
    });
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('inserts one row per subscribed endpoint', async () => {
    queryMock
      .mockResolvedValueOnce([{ id: 'e1' }, { id: 'e2' }]) // SELECT
      .mockResolvedValueOnce([]); // INSERT
    await enqueueDelivery({
      schoolId: 's1',
      event: 'donation.created',
      data: { id: 'd1' },
      environment: 'live',
    });
    const insertCall = queryMock.mock.calls[1];
    expect(insertCall[0]).toMatch(/INSERT INTO webhook_deliveries/);
    // 2 endpoint × 3 placeholder = 6 param
    expect(insertCall[1]).toHaveLength(6);
  });
});

describe('processDueDeliveries', () => {
  const dueRow = {
    id: 'del_1',
    endpoint_id: 'e1',
    payload: { id: 'evt_1', event: 'donation.created', data: {} },
    attempt_count: 0,
    url: 'https://hook.example/webhook',
    secret: 'whsec_test',
  };

  it('marks delivery as delivered on 200 + signs body with HMAC', async () => {
    queryMock
      .mockResolvedValueOnce([dueRow]) // pick
      .mockResolvedValueOnce([]); // UPDATE delivered
    (axios.post as any).mockResolvedValueOnce({ status: 200 });

    await processDueDeliveries();

    const [url, body, opts] = (axios.post as any).mock.calls[0];
    expect(url).toBe(dueRow.url);
    const sig = opts.headers['X-FundEd-Signature'];
    expect(verify(body, sig, dueRow.secret).ok).toBe(true);

    expect(queryMock.mock.calls[1][0]).toMatch(/SET status='delivered'/);
  });

  it('schedules backoff retry on failure (not dead)', async () => {
    queryMock
      .mockResolvedValueOnce([dueRow]) // pick
      .mockResolvedValueOnce([]); // UPDATE retry
    (axios.post as any).mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await processDueDeliveries();

    const upd = queryMock.mock.calls[1];
    expect(upd[0]).toMatch(/next_attempt_at/);
    // attempt_count=1, status=pending, backoff=300 (5m, index 1)
    expect(upd[1][1]).toBe(1);
    expect(upd[1][2]).toBe('pending');
    expect(upd[1][3]).toBe(300);
  });

  it('marks delivery as dead after MAX_ATTEMPTS', async () => {
    queryMock
      .mockResolvedValueOnce([{ ...dueRow, attempt_count: 5 }]) // 5 → next=6 → dead
      .mockResolvedValueOnce([]);
    (axios.post as any).mockRejectedValueOnce(new Error('boom'));

    await processDueDeliveries();

    const upd = queryMock.mock.calls[1];
    expect(upd[1][2]).toBe('dead');
  });
});
