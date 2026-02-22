// ═══════════════════════════════════════════════════════
// Centralized Currency Formatting & Conversion
// ═══════════════════════════════════════════════════════

export type CurrencyCode = 'USD' | 'TRY';

/**
 * Format a monetary amount with the correct symbol and locale conventions.
 *
 *  formatCurrency(1250, 'USD', 'en')  → "$1,250.00"
 *  formatCurrency(43750, 'TRY', 'tr') → "₺43.750,00"
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  locale?: string,
): string {
  const loc = locale ?? (currency === 'TRY' ? 'tr-TR' : 'en-US');

  return new Intl.NumberFormat(loc, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/**
 * Convert a USD amount to target currency.
 */
export function convertAmount(amountUSD: number, rate: number): number {
  return amountUSD * rate;
}

/**
 * Convert a TRY amount back to USD.
 */
export function convertToUSD(amountTRY: number, rate: number): number {
  if (rate <= 0) return amountTRY;
  return amountTRY / rate;
}

/**
 * Get preset donation amounts for a given currency.
 * TRY presets are rounded "nice" numbers based on current exchange rate.
 */
export function getPresetAmounts(currency: CurrencyCode, rate: number = 1): number[] {
  if (currency === 'USD') {
    return [25, 50, 100, 250, 750, 2500, 5000];
  }

  // TRY — generate user-friendly round numbers
  const usdPresets = [25, 50, 100, 250, 750, 2500, 5000];
  return usdPresets.map((usd) => {
    const raw = usd * rate;
    // Round to nearest "nice" number
    if (raw < 100) return Math.round(raw / 10) * 10;
    if (raw < 1000) return Math.round(raw / 50) * 50;
    if (raw < 10000) return Math.round(raw / 500) * 500;
    return Math.round(raw / 1000) * 1000;
  });
}
