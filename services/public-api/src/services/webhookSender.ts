import crypto from 'node:crypto';
import axios, { AxiosError } from 'axios';
import { query } from '../lib/db';
import { sign } from '../lib/hmac';

/**
 * Webhook teslimatı:
 *  1. enqueueDelivery: outbox'a yaz (transactional w/ business event).
 *  2. processDueDeliveries: cron / worker — pending kayıtları işler.
 *
 * Retry: exponential backoff — 1m, 5m, 30m, 2h, 6h, 24h. 6. başarısızlıkta `dead`.
 */

const BACKOFF_SECONDS = [60, 300, 1800, 7200, 21_600, 86_400];
const MAX_ATTEMPTS = BACKOFF_SECONDS.length;
const HTTP_TIMEOUT_MS = 10_000;

export type WebhookEvent =
  | 'donation.created'
  | 'campaign.completed'
  | 'monthly_report.ready';

export async function enqueueDelivery(args: {
  schoolId: string;
  event: WebhookEvent;
  data: unknown;
  environment: 'live' | 'sandbox';
}): Promise<void> {
  const endpoints = await query<{ id: string }>(
    `SELECT id FROM webhook_endpoints
      WHERE school_id = $1
        AND environment = $2
        AND status = 'active'
        AND $3 = ANY(events)`,
    [args.schoolId, args.environment, args.event],
  );

  if (endpoints.length === 0) return;

  const payload = {
    id: crypto.randomUUID(),
    event: args.event,
    created_at: new Date().toISOString(),
    data: args.data,
  };

  // Tek SQL'de toplu insert.
  const values = endpoints
    .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3}::jsonb)`)
    .join(',');
  const params = endpoints.flatMap((e) => [e.id, args.event, JSON.stringify(payload)]);

  await query(
    `INSERT INTO webhook_deliveries (endpoint_id, event_type, payload) VALUES ${values}`,
    params,
  );
}

/** Worker döngüsünden çağrılır. Bir batch işler. */
export async function processDueDeliveries(batchSize = 50): Promise<{ processed: number }> {
  // SKIP LOCKED → birden fazla worker çakışmasın.
  const due = await query<{
    id: string;
    endpoint_id: string;
    payload: any;
    attempt_count: number;
    url: string;
    secret: string;
  }>(
    `WITH picked AS (
       SELECT d.id
         FROM webhook_deliveries d
        WHERE d.status = 'pending' AND d.next_attempt_at <= now()
        ORDER BY d.next_attempt_at
        LIMIT $1
        FOR UPDATE SKIP LOCKED
     )
     SELECT d.id, d.endpoint_id, d.payload, d.attempt_count, e.url, e.secret
       FROM webhook_deliveries d
       JOIN webhook_endpoints e ON e.id = d.endpoint_id
       JOIN picked p ON p.id = d.id`,
    [batchSize],
  );

  await Promise.all(due.map(deliverOne));
  return { processed: due.length };
}

async function deliverOne(row: {
  id: string;
  payload: any;
  attempt_count: number;
  url: string;
  secret: string;
}): Promise<void> {
  const rawBody = JSON.stringify(row.payload);
  const signature = sign(rawBody, row.secret);

  try {
    const res = await axios.post(row.url, rawBody, {
      timeout: HTTP_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        'X-FundEd-Signature': signature,
        'X-FundEd-Event': row.payload.event,
        'X-FundEd-Delivery': row.id,
        'User-Agent': 'FundEd-Webhooks/1.0',
      },
      // 4xx/5xx exception fırlatsın diye:
      validateStatus: (s) => s >= 200 && s < 300,
    });
    await query(
      `UPDATE webhook_deliveries
          SET status='delivered', delivered_at=now(),
              attempt_count = attempt_count + 1, last_status = $2
        WHERE id = $1`,
      [row.id, res.status],
    );
  } catch (err) {
    const e = err as AxiosError;
    const nextAttempt = row.attempt_count + 1;
    const isDead = nextAttempt >= MAX_ATTEMPTS;
    const backoff = BACKOFF_SECONDS[Math.min(nextAttempt, MAX_ATTEMPTS - 1)];
    const status = e.response?.status ?? null;
    const message = e.message?.slice(0, 500) ?? 'unknown';

    await query(
      `UPDATE webhook_deliveries
          SET attempt_count = $2,
              status        = $3,
              next_attempt_at = now() + ($4 || ' seconds')::interval,
              last_error    = $5,
              last_status   = $6
        WHERE id = $1`,
      [row.id, nextAttempt, isDead ? 'dead' : 'pending', backoff, message, status],
    );
  }
}
