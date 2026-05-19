/**
 * Webhook delivery worker — bağımsız process.
 *
 * Production'da HTTP API ile aynı process'te çalışmamalı:
 * - HTTP load worker döngüsünü engellememeli.
 * - Bağımsız ölçeklenebilmeli (N replica × `FOR UPDATE SKIP LOCKED`).
 *
 *   node dist/worker.js
 */

import { processDueDeliveries } from './services/webhookSender';
import { pool } from './lib/db';

const TICK_MS = Number(process.env.WORKER_TICK_MS ?? 5_000);
const BATCH = Number(process.env.WORKER_BATCH_SIZE ?? 50);

let running = true;
let activeRun: Promise<unknown> = Promise.resolve();

async function loop(): Promise<void> {
  while (running) {
    activeRun = processDueDeliveries(BATCH).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[webhook-worker] tick failed', err);
    });
    await activeRun;
    if (!running) break;
    await new Promise((r) => setTimeout(r, TICK_MS));
  }
}

async function shutdown(signal: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`[webhook-worker] ${signal} — draining`);
  running = false;
  await activeRun;
  await pool.end();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// eslint-disable-next-line no-console
console.log(`[webhook-worker] started (tick=${TICK_MS}ms batch=${BATCH})`);
loop().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[webhook-worker] crashed', err);
  process.exit(1);
});
