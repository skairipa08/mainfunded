import { getDb } from '@/lib/db';
import { storage } from '@/lib/storage';

export const EXPENDITURE_CATEGORIES = [
  'Okul Ücreti',
  'Kitap',
  'Kırtasiye',
  'Ulaşım',
  'Diğer',
] as const;

export type ExpenditureCategory = (typeof EXPENDITURE_CATEGORIES)[number];
export type ExpenditureStatus = 'pending' | 'approved' | 'rejected';

export interface ExpenditureReceipt {
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
}

export interface ExpenditureRecord {
  expenditure_id: string;
  campaign_id: string;
  category: ExpenditureCategory;
  custom_category?: string;
  amount: number;
  currency: 'TRY';
  description: string;
  receipt: ExpenditureReceipt;
  status: ExpenditureStatus;
  created_by: string;
  created_by_name: string;
  created_by_role: string;
  approved_by?: string;
  approved_by_name?: string;
  review_note?: string;
  reviewed_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export function isValidExpenditureCategory(value: string): value is ExpenditureCategory {
  return EXPENDITURE_CATEGORIES.includes(value as ExpenditureCategory);
}

export async function getCampaignFinancialSummary(campaignId: string) {
  const db = await getDb();

  const [donationAgg, expenditureAgg] = await Promise.all([
    db.collection('donations').aggregate([
      { $match: { campaign_id: campaignId, status: 'paid' } },
      {
        $group: {
          _id: null,
          raised_amount: { $sum: { $ifNull: ['$amount', 0] } },
        },
      },
    ]).toArray(),
    db.collection('expenditures').aggregate([
      { $match: { campaign_id: campaignId, status: 'approved' } },
      {
        $group: {
          _id: null,
          spent_amount: { $sum: { $ifNull: ['$amount', 0] } },
        },
      },
    ]).toArray(),
  ]);

  const raised = donationAgg[0]?.raised_amount ?? 0;
  const spent = expenditureAgg[0]?.spent_amount ?? 0;

  return {
    raised_amount: raised,
    spent_amount: spent,
    remaining_amount: raised - spent,
  };
}

export function withReceiptUrl<T extends { receipt?: ExpenditureReceipt }>(item: T) {
  if (!item.receipt?.storage_path) {
    return item;
  }

  return {
    ...item,
    receipt_url: storage.getSignedUrl(item.receipt.storage_path),
  };
}
