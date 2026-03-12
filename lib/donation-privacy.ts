/**
 * Donation privacy utilities for FundEd.
 *
 * Rules:
 *  - anonymous === true  →  "Bir destekçi"
 *  - name has surname    →  "Ahmet K."  (first name + last initial + dot)
 *  - single name only    →  returned as-is
 *  - empty / null        →  "Bir destekçi"
 */

export function maskDonorName(name: string | null | undefined, anonymous: boolean): string {
  if (anonymous) return 'Bir destekçi';
  if (!name || name.trim() === '') return 'Bir destekçi';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

/** Format currency amount with symbol */
export function formatDonationAmount(
  amount: number,
  currency: string = 'TRY'
): string {
  const symbols: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const symbol = symbols[currency.toUpperCase()] ?? currency;

  // Turkish locale puts the symbol after for TRY
  if (currency.toUpperCase() === 'TRY') {
    return `${amount.toLocaleString('tr-TR')}${symbol}`;
  }
  return `${symbol}${amount.toLocaleString('en-US')}`;
}

export interface RecentDonation {
  displayName: string;
  amount: number;
  currency: string;
  anonymous: boolean;
  createdAt: string | Date;
  message?: string;
}
