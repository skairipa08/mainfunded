import useSWR from 'swr';
import { Campaign } from '@/types';

const fetcher = (url: string) => fetch(url).then(async (res) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch campaign data');
    }
    return res.json();
});

export function useCampaignProgress(campaignId: string) {
    const { data, error, isLoading } = useSWR(
        `/api/campaigns/${campaignId}`,
        fetcher,
        {
            refreshInterval: 60000, // Refresh every 60 seconds
            revalidateOnFocus: true,
        }
    );

    return {
        campaign: data?.data as Campaign & { raised_amount: number; donor_count: number } | undefined,
        isLoading,
        isError: !!error,
    };
}
