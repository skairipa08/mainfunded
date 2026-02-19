/**
 * Fee calculation utilities for Net Fee Coverage system.
 *
 * When a donor opts to "cover fees", the total charge is increased so that
 * the student receives the exact intended donation amount after all fees
 * are deducted.
 *
 * Fee breakdown:
 *   - Stripe processing fee : 3.2 %
 *   - Platform fee          : 2.0 %
 *   - Total fee rate        : 5.2 %
 *   - Net retention rate    : 94.8 % (1 − 0.052)
 *
 * Formula:  totalCharge = netAmount / 0.948
 */

export interface FeeBreakdown {
  /** The amount the student will receive (net). */
  baseAmount: number;
  /** Estimated Stripe processing fee (3.2 %). */
  stripeFee: number;
  /** Platform fee (2.0 %). */
  platformFee: number;
  /** Total amount charged to the donor. */
  totalCharge: number;
}

const STRIPE_FEE_RATE = 0.032;
const PLATFORM_FEE_RATE = 0.02;
const TOTAL_FEE_RATE = STRIPE_FEE_RATE + PLATFORM_FEE_RATE; // 0.052
const NET_RATE = 1 - TOTAL_FEE_RATE; // 0.948

/**
 * Calculate the total charge needed so that `netAmount` reaches the student
 * after Stripe and platform fees are deducted.
 *
 * @param netAmount - The desired net donation amount (must be > 0).
 * @returns A `FeeBreakdown` with all amounts rounded to two decimals.
 * @throws {Error} If `netAmount` is not a positive finite number.
 */
export function calculateTotalWithFees(netAmount: number): FeeBreakdown {
  if (!Number.isFinite(netAmount) || netAmount <= 0) {
    throw new Error('netAmount must be a positive number');
  }

  const totalCharge = parseFloat((netAmount / NET_RATE).toFixed(2));
  const stripeFee = parseFloat((totalCharge * STRIPE_FEE_RATE).toFixed(2));
  const platformFee = parseFloat((totalCharge * PLATFORM_FEE_RATE).toFixed(2));

  return {
    baseAmount: parseFloat(netAmount.toFixed(2)),
    stripeFee,
    platformFee,
    totalCharge,
  };
}
