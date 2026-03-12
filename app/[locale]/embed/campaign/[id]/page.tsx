import React from 'react';
import { notFound } from 'next/navigation';
import { getCampaign } from '@/lib/api';
import EmbedWidget from '@/components/campaign/EmbedWidget';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Campaign Embedded Widget',
        robots: {
            index: false,
            follow: false,
        }
    };
}

export default async function EmbedCampaignPage({
    params,
    searchParams
}: {
    params: { id: string, locale: string },
    searchParams: { theme?: string }
}) {
    try {
        const campaignRes = await getCampaign(params.id);
        const campaign = campaignRes?.success ? campaignRes.data : campaignRes;

        if (!campaign || (!campaign.campaign_id && !campaign._id)) {
            notFound();
        }

        const theme = (searchParams.theme as 'light' | 'dark') || 'light';

        return (
            <div className="w-full h-screen">
                {/* Inject global styles specific to the embed to override any layout defaults if necessary */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          html, body {
            background-color: transparent !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            height: 100% !important;
            width: 100% !important;
          }
          /* Hide the floating Ai Assistant or Chatbots in embed */
          #ai-assistant-wrapper, .intercom-lightweight-app {
            display: none !important;
          }
        `}} />
                <EmbedWidget
                    campaign={campaign}
                    locale={params.locale}
                    theme={theme}
                />
            </div>
        );
    } catch (error) {
        console.error('Failed to load campaign for embed:', error);
        notFound();
    }
}
