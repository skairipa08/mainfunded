import { getDb } from '@/lib/db';
import { createNotification } from '@/lib/notification-helpers';
import { sendEmail, renderExpenditureApprovedEmail } from '@/lib/email';

interface NotifyDonorsParams {
  campaignId: string;
  campaignTitle: string;
  expenditure: {
    expenditure_id: string;
    category: string;
    custom_category?: string;
    amount: number;
    currency?: string;
    description: string;
    published_at?: string;
  };
}

export async function notifyDonorsForApprovedExpenditure(params: NotifyDonorsParams) {
  const db = await getDb();

  const donors = await db.collection('donations').aggregate([
    {
      $match: {
        campaign_id: params.campaignId,
        status: 'paid',
      },
    },
    {
      $group: {
        _id: '$donor_email',
        donor_email: { $first: '$donor_email' },
        donor_id: { $first: '$donor_id' },
        donor_name: { $first: '$donor_name' },
      },
    },
    {
      $match: {
        donor_email: { $ne: null },
      },
    },
  ]).toArray();

  if (donors.length === 0) {
    return { notified: 0 };
  }

  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';

  await Promise.allSettled(
    donors.map(async (donor: any) => {
      const donorName = donor.donor_name || 'Destekçimiz';

      await sendEmail({
        to: donor.donor_email,
        subject: `Yeni Harcama Güncellemesi • ${params.campaignTitle}`,
        html: renderExpenditureApprovedEmail({
          donorName,
          campaignTitle: params.campaignTitle,
          campaignId: params.campaignId,
          category: params.expenditure.custom_category || params.expenditure.category,
          amount: params.expenditure.amount,
          currency: params.expenditure.currency || 'TRY',
          description: params.expenditure.description,
          publishedAt: params.expenditure.published_at || new Date().toISOString(),
          campaignUrl: `${baseUrl}/campaign/${params.campaignId}`,
        }),
      });

      if (donor.donor_id) {
        await createNotification({
          userId: donor.donor_id,
          type: 'campaign',
          title: 'Kampanya Harcama Güncellemesi',
          message: `Desteklediğiniz "${params.campaignTitle}" kampanyasında yeni bir harcama onaylandı.`,
          link: `/campaign/${params.campaignId}`,
          metadata: {
            campaignId: params.campaignId,
            campaignTitle: params.campaignTitle,
            expenditureId: params.expenditure.expenditure_id,
            amount: params.expenditure.amount,
            category: params.expenditure.category,
          },
        });
      }
    })
  );

  return { notified: donors.length };
}
