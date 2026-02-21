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
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Exchange rate API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.result !== 'success' || typeof data.conversion_rate !== 'number') {
    throw new Error(`Exchange rate API error: ${data['error-type'] || 'unknown'}`);
  }

  const rate = data.conversion_rate as number;
  const db = await getDb();

  const doc: ExchangeRateDoc = {
    from: 'USD',
    to: 'TRY',
    rate,
    updatedAt: new Date(),
  };

  await db.collection(COLLECTION).updateOne(
    { from: 'USD', to: 'TRY' },
    { $set: doc },
    { upsert: true }
  );

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
        updatedAt: doc.updatedAt,
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
