export function calculateMilestoneRelease(
  totalCollected: number,
  milestonePercentage: number
): number {
  return Math.round((totalCollected * milestonePercentage) / 100 * 100) / 100
}

export function calculateRefundPerDonor(
  donorAmount: number,
  totalCollected: number,
  totalReleased: number
): number {
  if (totalCollected === 0) return 0
  const refundablePool = totalCollected - totalReleased
  return Math.round((donorAmount / totalCollected) * refundablePool * 100) / 100
}
