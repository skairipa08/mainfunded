import { getDb } from './db';

// ═══════════════════════════════════════════════════════
// Exchange Rate Service — USD/TRY
// Fetches from exchangerate-api.com, caches in MongoDB
// ═══════════════════════════════════════════════════════

const COLLECTION = 'exchange_rates';
const DEFAULT_RATE = 36.5; // Fallback if API + cache both unavailable

export interface ExchangeRateDoc {
  from: string;
  to: string;
  rate: number;
  updatedAt: Date;
}

/**
 * Fetch the latest USD→TRY rate from exchangerate-api.com
 * and store it in MongoDB.
 */
export async function updateExchangeRate(): Promise<ExchangeRateDoc> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    throw new Error('EXCHANGE_RATE_API_KEY environment variable is not set');
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/TRY`;

  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Exchange rate API returned ${response.status}: ${response.statusText}. Body: ${body}`
    );
  }

  const data = await response.json();

  if (data.result !== 'success' || typeof data.conversion_rate !== 'number') {
    throw new Error(
      `Exchange rate API error: ${data['error-type'] || JSON.stringify(data)}`
    );
  }

  const rate = data.conversion_rate as number;

  // Try to cache in MongoDB, but don't fail if DB is unavailable
  const doc: ExchangeRateDoc = {
    from: 'USD',
    to: 'TRY',
    rate,
    updatedAt: new Date(),
  };

  try {
    const db = await getDb();
    await db.collection(COLLECTION).updateOne(
      { from: 'USD', to: 'TRY' },
      { $set: doc },
      { upsert: true }
    );
  } catch (dbErr) {
    console.warn('[ExchangeRate] Failed to cache rate in DB:', dbErr);
  }

  console.log(`[ExchangeRate] Updated USD/TRY = ${rate}`);
  return doc;
}

/**
 * Get the cached USD→TRY exchange rate from MongoDB.
 * Falls back to a hardcoded default if cache is empty.
 */
export async function getExchangeRate(
  from: string = 'USD',
  to: string = 'TRY'
): Promise<ExchangeRateDoc> {
  try {
    const db = await getDb();
    const doc = await db.collection<ExchangeRateDoc>(COLLECTION).findOne({ from, to });

    if (doc) {
      return {
        from: doc.from,
        to: doc.to,
        rate: doc.rate,
        updatedAt: new Date(doc.updatedAt), // ensure it's a Date object
      };
    }
  } catch (error) {
    console.error('[ExchangeRate] Failed to read from cache:', error);
  }

  // Fallback — no cached rate available
  return {
    from,
    to,
    rate: DEFAULT_RATE,
    updatedAt: new Date(0), // epoch = stale indicator
  };
}
