import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { simulate } from './matching-engine';
import { periodKey } from './period';
import { getSpentInPeriod } from './budget';
import { findActiveAffiliationByUser } from './affiliation-repo';
import { createTransaction, findTransactionByDonation } from './transaction-repo';

export type DonationCreatedEvent = {
  donationId: string;
  donorUserId: string;
  campaignId: string;
  amountTRY: number;
  category: string;
};

/**
 * Fire-and-forget hook called from the donation creation path. Never throws.
 * Creates a MatchingTransaction (PENDING or REJECTED) when applicable.
 */
export async function onDonationCreated(event: DonationCreatedEvent): Promise<void> {
  try {
    // Idempotency: skip if a transaction for this donation already exists
    const existing = await findTransactionByDonation(event.donationId);
    if (existing) return;

    // 1. Active employee affiliation
    const affiliation = await findActiveAffiliationByUser(event.donorUserId);
    if (!affiliation) return;

    // 2. Approved company
    const company = await prisma.company.findUnique({
      where: { id: affiliation.companyId },
      include: { matchingRule: true },
    });
    if (!company || company.status !== 'APPROVED') return;
    if (!company.matchingRule) return;

    const rule = company.matchingRule;
    const period = periodKey(new Date());
    const spent = await getSpentInPeriod(company.id, period);

    const result = simulate({
      donationAmountTRY: event.amountTRY,
      category: event.category,
      rule,
      spentInPeriodTRY: spent,
    });

    if (result.matched) {
      await createTransaction({
        companyId: company.id,
        ruleId: rule.id,
        donationId: event.donationId,
        campaignId: event.campaignId,
        donorUserId: event.donorUserId,
        category: event.category,
        donationAmountTRY: event.amountTRY,
        matchedAmountTRY: result.matchedAmountTRY,
        ratioApplied: result.ratioApplied,
        status: 'PENDING',
        periodKey: period,
      });
    } else {
      // Audit: write the rejection too so donor history is complete
      await createTransaction({
        companyId: company.id,
        ruleId: rule.id,
        donationId: event.donationId,
        campaignId: event.campaignId,
        donorUserId: event.donorUserId,
        category: event.category,
        donationAmountTRY: event.amountTRY,
        matchedAmountTRY: 0,
        ratioApplied: rule.ratio,
        status: 'REJECTED',
        rejectReason: result.reason,
        periodKey: period,
      });
    }
  } catch (err) {
    logger.error('[corporate.trigger]', {
      donationId: event.donationId,
      error: String(err),
    });
    // Never throw — donations must succeed regardless
  }
}
