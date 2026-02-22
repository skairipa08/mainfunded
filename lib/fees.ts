/**
 * Fee calculation utilities for Net Fee Coverage system.
 *
 * When a donor opts to "cover fees", the total charge is increased so that
 * the student receives the exact intended donation amount after all fees
 * are deducted.
 *
 * Fee breakdown:
 *   - iyzico processing fee : 3.54 % (+ 0.25 TRY)
 *   - Platform fee          : 2.0 %
 *   - Total fee rate        : 5.54 %
 *   - Net retention rate    : 94.46 % (1 − 0.0554)
 *
 * Formula:  totalCharge = (netAmount + 0.25) / 0.9446
 */

export interface FeeBreakdown {
  /** The amount the student will receive (net). */
  baseAmount: number;
  /** Estimated iyzico processing fee (3.54 % + 0.25 TRY). */
  iyzicoFee: number;
  /** Platform fee (2.0 %). */
  platformFee: number;
  /** Total amount charged to the donor. */
  totalCharge: number;
}

const IYZICO_FEE_RATE = 0.0354;
const IYZICO_FIXED_FEE = 0.25; // TRY
const PLATFORM_FEE_RATE = 0.02;
const TOTAL_FEE_RATE = IYZICO_FEE_RATE + PLATFORM_FEE_RATE; // 0.0554
const NET_RATE = 1 - TOTAL_FEE_RATE; // 0.9446

/**
 * Calculate the total charge needed so that `netAmount` reaches the student
 * after iyzico and platform fees are deducted.
 *
 * @param netAmount - The desired net donation amount (must be > 0).
 * @returns A `FeeBreakdown` with all amounts rounded to two decimals.
 * @throws {Error} If `netAmount` is not a positive finite number.
 */
export function calculateTotalWithFees(netAmount: number): FeeBreakdown {
  if (!Number.isFinite(netAmount) || netAmount <= 0) {
    throw new Error('netAmount must be a positive number');
  }

  const totalCharge = parseFloat(((netAmount + IYZICO_FIXED_FEE) / NET_RATE).toFixed(2));
  const iyzicoFee = parseFloat((totalCharge * IYZICO_FEE_RATE + IYZICO_FIXED_FEE).toFixed(2));
  const platformFee = parseFloat((totalCharge * PLATFORM_FEE_RATE).toFixed(2));

  return {
    baseAmount: parseFloat(netAmount.toFixed(2)),
    iyzicoFee,
    platformFee,
    totalCharge,
  };
}
