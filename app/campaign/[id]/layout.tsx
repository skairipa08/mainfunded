import { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const db = await getDb();
    let campaign;

    if (ObjectId.isValid(params.id)) {
      campaign = await db.collection('campaigns').findOne({ _id: new ObjectId(params.id) });
    }
    if (!campaign) {
      campaign = await db.collection('campaigns').findOne({ slug: params.id });
    }

    if (!campaign) {
      return {
        title: 'Kampanya Bulunamadı',
        description: 'Bu kampanya mevcut değil veya kaldırılmış olabilir.',
      };
    }

    const title = campaign.title as string;
    const description = (campaign.description as string)?.slice(0, 160) || `${title} - FundEd kampanyası`;
    const pct = campaign.goal_amount > 0
      ? Math.round(((campaign.raised_amount ?? 0) / campaign.goal_amount) * 100)
      : 0;

    return {
      title,
      description,
      openGraph: {
        title: `${title} | FundEd`,
        description,
        type: 'article',
        images: campaign.images?.[0] ? [{ url: campaign.images[0], width: 1200, height: 630, alt: title }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | FundEd`,
        description: `%${pct} funded · ${description}`,
      },
    };
  } catch {
    return { title: 'Kampanya | FundEd' };
  }
}

export default function CampaignLayout({ children }: Props) {
  return children;
}
