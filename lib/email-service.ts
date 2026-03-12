import { Resend } from 'resend';
import { render } from '@react-email/render';
import ImpactReportEmail from '@/components/emails/ImpactReportEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'FundEd <onboarding@resend.dev>';

export async function sendImpactReportEmail({
    to,
    donorName,
    studentName,
    studentPhotoUrl,
    yearsSupported,
    newAchievements,
    gpaChange,
    followUrl,
    impactCardUrl,
    campaignUrl,
    t,
}: {
    to: string;
    donorName: string;
    studentName: string;
    studentPhotoUrl: string;
    yearsSupported: number;
    newAchievements: string[];
    gpaChange?: string;
    followUrl: string;
    impactCardUrl: string;
    campaignUrl: string;
    t: (key: string, variables?: Record<string, any>) => string;
}) {
    const html = await render(
        ImpactReportEmail({
            donorName,
            studentName,
            studentPhotoUrl,
            yearsSupported,
            newAchievements,
            gpaChange,
            followUrl,
            impactCardUrl,
            campaignUrl,
            t,
        })
    );

    const subject = t('email.impactReport.header', { years: yearsSupported });

    try {
        const data = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('[sendImpactReportEmail] Error:', error);
        return { success: false, error };
    }
}
