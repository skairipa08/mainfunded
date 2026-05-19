import { Resend } from 'resend';
import { render } from '@react-email/render';
import { logger } from '@/lib/logger';
import {
  BudgetThreshold80Email,
  BudgetThresholdReachedEmail,
} from './email-templates';

const EMAIL_FROM = process.env.EMAIL_FROM || 'FundEd <onboarding@resend.dev>';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 're_placeholder');
}

type AlertKind = '80' | '100';

export async function sendBudgetAlert(
  kind: AlertKind,
  company: { contactEmail: string; name: string },
  periodKey: string,
  spentTRY: number,
  limitTRY: number
): Promise<void> {
  try {
    const subject =
      kind === '80'
        ? "Bütçenizin %80'i kullanıldı"
        : 'Aylık eşleştirme bütçeniz tükendi';
    const html =
      kind === '80'
        ? await render(
            BudgetThreshold80Email({
              companyName: company.name,
              periodKey,
              spentTRY,
              limitTRY,
            })
          )
        : await render(
            BudgetThresholdReachedEmail({
              companyName: company.name,
              periodKey,
              limitTRY,
            })
          );
    await getResend().emails.send({
      from: EMAIL_FROM,
      to: company.contactEmail,
      subject,
      html,
    });
  } catch (err) {
    logger.error('[corporate.email-sender]', {
      kind,
      to: company.contactEmail,
      error: String(err),
    });
  }
}
