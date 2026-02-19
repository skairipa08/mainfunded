/**
 * Transactional email system using Resend
 * Gracefully handles failures without breaking main flows
 */

import { maskEmail } from '@/lib/pii-mask';

/** Escape user-supplied strings before embedding in HTML emails */
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailTemplateData {
  [key: string]: any;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'FundEd <noreply@funded.com>';

/**
 * Send email using Resend API
 * Returns true on success, false on failure
 * Never throws - failures are logged but don't break the flow
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Skip if Resend not configured (read at call time, not build time)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email] Skipped (RESEND_API_KEY not set):', maskEmail(options.to), options.subject);
    }
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      // Log error but don't expose sensitive data
      console.error('[Email] Failed to send:', {
        to: maskEmail(options.to),
        subject: options.subject,
        status: response.status,
        error: error.substring(0, 200), // Limit error length
      });
      return false;
    }

    const result = await response.json();
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email] Sent successfully:', maskEmail(options.to), options.subject);
    }
    return true;
  } catch (error: any) {
    // Log error but don't expose stack traces or sensitive data
    console.error('[Email] Error sending email:', {
      to: maskEmail(options.to),
      subject: options.subject,
      message: error.message || 'Unknown error',
    });
    return false;
  }
}

/**
 * Email template: Student verified
 */
export function renderStudentVerifiedEmail(data: {
  studentName: string;
  studentEmail: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Verification Approved!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${escapeHtml(data.studentName) || 'Student'},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Great news! Your student verification has been approved. You can now create and publish campaigns on FundEd.
    </p>
    
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>What's next?</strong><br>
        • Create your first campaign<br>
        • Share your educational goals<br>
        • Start receiving donations
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.AUTH_URL || 'http://localhost:3000'}/dashboard" 
         style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Go to Dashboard
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      If you have any questions, please contact our support team.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FundEd. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email template: Student rejected
 */
export function renderStudentRejectedEmail(data: {
  studentName: string;
  studentEmail: string;
  reason?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ef4444; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Verification Update</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${escapeHtml(data.studentName) || 'Student'},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We've reviewed your student verification request. Unfortunately, we're unable to approve it at this time.
    </p>
    
    ${data.reason ? `
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        <strong>Reason:</strong><br>
        ${escapeHtml(data.reason || '')}
      </p>
    </div>
    ` : ''}
    
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>What can you do?</strong><br>
        • Review your submitted documents<br>
        • Ensure all information is accurate<br>
        • Contact support if you have questions
      </p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      If you believe this is an error or have additional information, please contact our support team.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FundEd. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email template: Donation success
 */
export function renderDonationSuccessEmail(data: {
  donorName: string;
  donorEmail: string;
  amount: number;
  campaignTitle: string;
  campaignId: string;
  anonymous: boolean;
}): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.amount);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">💝 Thank You for Your Donation!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${escapeHtml(data.donorName)},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for your generous donation of <strong>${formattedAmount}</strong> to support:
    </p>
    
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1e40af;">
        ${escapeHtml(data.campaignTitle)}
      </p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your contribution is making a real difference in a student's educational journey.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.AUTH_URL || 'http://localhost:3000'}/campaign/${data.campaignId}" 
         style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        View Campaign
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      A receipt has been sent to this email address. If you have any questions, please contact our support team.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FundEd. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email template: Campaign published
 */
export function renderCampaignPublishedEmail(data: {
  studentName: string;
  studentEmail: string;
  campaignTitle: string;
  campaignId: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🚀 Your Campaign is Live!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${escapeHtml(data.studentName)},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Great news! Your campaign "<strong>${escapeHtml(data.campaignTitle)}</strong>" has been published and is now live on FundEd.
    </p>
    
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>Tips for success:</strong><br>
        • Share your campaign on social media<br>
        • Update your campaign with progress<br>
        • Thank your donors personally
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.AUTH_URL || 'http://localhost:3000'}/campaign/${data.campaignId}" 
         style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        View Campaign
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      Good luck with your fundraising journey!
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FundEd. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email template: Admin notification - new student pending
 */
export function renderAdminNotificationEmail(data: {
  studentName: string;
  studentEmail: string;
  studentId: string;
}): string {
  const adminUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/admin/students/${data.studentId}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f59e0b; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ New Student Verification Request</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello Admin,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      A new student verification request has been submitted:
    </p>
    
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Student:</strong> ${escapeHtml(data.studentName) || 'N/A'}<br>
        <strong>Email:</strong> ${escapeHtml(data.studentEmail)}<br>
        <strong>Status:</strong> Pending Review
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${adminUrl}" 
         style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Review Request
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      Please review the student's profile and documents in the admin panel.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FundEd. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

// ─── Payout Notification Emails ──────────────────────────────────

interface PayoutEmailData {
  studentName: string;
  amount: number;
  referenceCode: string;
}

function payoutEmailWrapper(title: string, color: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${color}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    ${body}
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p>
  </div>
</body>
</html>`.trim();
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function renderStripePayoutNotification(data: PayoutEmailData): string {
  return payoutEmailWrapper('💳 Stripe Ödeme Bildirimi', '#635bff', `
    <p>Merhaba ${escapeHtml(data.studentName)},</p>
    <p><strong>${formatUSD(data.amount)}</strong> tutarındaki ödemeniz Stripe Connect hesabınıza otomatik olarak aktarılmıştır.</p>
    <div style="background: #f0f9ff; border-left: 4px solid #635bff; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Referans:</strong> ${escapeHtml(data.referenceCode)}</p>
    </div>
    <p style="font-size: 14px; color: #6b7280;">Transfer genellikle 1-2 iş günü içinde Stripe hesabınıza yansır.</p>
  `);
}

export function renderPaypalPayoutNotification(data: PayoutEmailData): string {
  return payoutEmailWrapper('💰 PayPal Ödeme Bildirimi', '#003087', `
    <p>Merhaba ${escapeHtml(data.studentName)},</p>
    <p><strong>${formatUSD(data.amount)}</strong> tutarındaki ödemeniz PayPal hesabınıza gönderilmiştir.</p>
    <div style="background: #fff8e1; border-left: 4px solid #003087; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Referans:</strong> ${escapeHtml(data.referenceCode)}</p>
    </div>
    <p style="font-size: 14px; color: #6b7280;">Ödeme genellikle birkaç dakika içinde PayPal bakiyenize yansır.</p>
  `);
}

export function renderWisePayoutNotification(data: PayoutEmailData): string {
  return payoutEmailWrapper('🌍 Wise Ödeme Bildirimi', '#9fe870', `
    <p>Merhaba ${escapeHtml(data.studentName)},</p>
    <p><strong>${formatUSD(data.amount)}</strong> tutarındaki ödemeniz Wise hesabınıza gönderilmiştir.</p>
    <div style="background: #f0fff4; border-left: 4px solid #9fe870; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Referans:</strong> ${escapeHtml(data.referenceCode)}</p>
    </div>
    <p style="font-size: 14px; color: #6b7280;">Transfer 1-3 iş günü içinde hesabınıza ulaşacaktır.</p>
  `);
}

export function renderPaparaPayoutNotification(data: PayoutEmailData): string {
  return payoutEmailWrapper('🟠 Papara Ödeme Bildirimi', '#e65100', `
    <p>Merhaba ${escapeHtml(data.studentName)},</p>
    <p><strong>${formatUSD(data.amount)}</strong> tutarındaki ödemeniz Papara hesabınıza gönderilmiştir.</p>
    <div style="background: #fff3e0; border-left: 4px solid #e65100; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Referans:</strong> ${escapeHtml(data.referenceCode)}</p>
    </div>
    <p style="font-size: 14px; color: #6b7280;">Ödeme genellikle anında Papara bakiyenize yansır.</p>
  `);
}
