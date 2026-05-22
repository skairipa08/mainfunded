import { Resend } from 'resend';
import { render } from '@react-email/render';
import ImpactReportEmail from '@/components/emails/ImpactReportEmail';

const EMAIL_FROM = process.env.EMAIL_FROM || 'FundEd <onboarding@resend.dev>';

function getResend() {
    return new Resend(process.env.RESEND_API_KEY || 're_placeholder');
}

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
        const data = await getResend().emails.send({
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

export async function sendAdvisorApprovalEmail(params: {
    advisorEmail: string
    advisorName: string
    projectTitle: string
    projectId: string
    token: string
}) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const approvalUrl = `${baseUrl}/api/projects/${params.projectId}/advisor-approve?token=${params.token}`

    try {
        const data = await getResend().emails.send({
            from: EMAIL_FROM,
            to: params.advisorEmail,
            subject: `Proje Danışman Onayı: ${params.projectTitle}`,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
                    <h2 style="color:#1e40af">Sayın ${params.advisorName},</h2>
                    <p><strong>${params.projectTitle}</strong> projesi için danışman onayınız bekleniyor.</p>
                    <p>Projeyi inceleyip onaylamak için aşağıdaki butona tıklayın:</p>
                    <a href="${approvalUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
                        Projeyi Onayla
                    </a>
                    <p style="color:#64748b;font-size:14px">Bu link tek kullanımlıktır ve 7 gün geçerlidir.</p>
                </div>
            `,
        })
        return { success: true, data }
    } catch (error) {
        console.error('[sendAdvisorApprovalEmail] Error:', error)
        return { success: false, error }
    }
}

export async function sendMilestoneRejectionEmail(params: {
    ownerEmail: string
    projectTitle: string
    milestoneTitle: string
    adminNote: string
}) {
    try {
        const data = await getResend().emails.send({
            from: EMAIL_FROM,
            to: params.ownerEmail,
            subject: `Milestone Reddedildi: ${params.projectTitle}`,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
                    <h2 style="color:#dc2626">Milestone Kanıtı Reddedildi</h2>
                    <p><strong>${params.projectTitle}</strong> projesindeki <strong>${params.milestoneTitle}</strong> milestone'u için yüklediğiniz kanıt reddedildi.</p>
                    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0">
                        <strong>Admin Notu:</strong>
                        <p style="margin:8px 0 0">${params.adminNote}</p>
                    </div>
                    <p>Lütfen eksiklikleri giderip yeni kanıt yükleyin.</p>
                </div>
            `,
        })
        return { success: true, data }
    } catch (error) {
        console.error('[sendMilestoneRejectionEmail] Error:', error)
        return { success: false, error }
    }
}
