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

const FROM_EMAIL = process.env.EMAIL_FROM || 'FundEd <onboarding@resend.dev>';

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

export function renderIyzicoPayoutNotification(data: PayoutEmailData): string {
  return payoutEmailWrapper('💳 iyzico Ödeme Bildirimi', '#1a1a2e', `
    <p>Merhaba ${escapeHtml(data.studentName)},</p>
    <p><strong>${formatUSD(data.amount)}</strong> tutarındaki ödemeniz iyzico hesabınıza otomatik olarak aktarılmıştır.</p>
    <div style="background: #f0f9ff; border-left: 4px solid #1a1a2e; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Referans:</strong> ${escapeHtml(data.referenceCode)}</p>
    </div>
    <p style="font-size: 14px; color: #6b7280;">Transfer genellikle 1-2 iş günü içinde hesabınıza yansır.</p>
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

// ─── OTP & Verification Email Templates ──────────────────────────

/**
 * Email template: OTP verification code
 */
export function renderOtpEmail(data: {
  userName?: string;
  otpCode: string;
  purpose?: string;
}): string {
  const purposeText = data.purpose || 'hesap doğrulama';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Doğrulama Kodu</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Merhaba${data.userName ? ' ' + escapeHtml(data.userName) : ''},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      ${escapeHtml(purposeText)} için doğrulama kodunuz:
    </p>
    
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; padding: 25px; margin: 25px 0; text-align: center; border-radius: 12px;">
      <p style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e40af; font-family: 'Courier New', monospace;">
        ${escapeHtml(data.otpCode)}
      </p>
    </div>
    
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        ⏱️ Bu kod <strong>5 dakika</strong> içinde geçerliliğini yitirecektir.<br>
        🔒 Bu kodu kimseyle paylaşmayın.
      </p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email template: Welcome email after registration
 */
export function renderWelcomeEmail(data: {
  userName: string;
  userEmail: string;
  accountType?: string;
}): string {
  const accountLabels: Record<string, string> = {
    student: '🎓 Öğrenci',
    donor: '💝 Bağışçı',
    mentor: '🧭 Mentor',
    parent: '👨‍👩‍👧 Veli',
    teacher: '📚 Öğretmen',
    school: '🏫 Okul',
  };
  const accountLabel = accountLabels[data.accountType || 'student'] || '🎓 Öğrenci';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 FundEd'e Hoş Geldiniz!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Merhaba ${escapeHtml(data.userName)},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      FundEd ailesine katıldığınız için çok mutluyuz! Hesabınız başarıyla oluşturuldu.
    </p>
    
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>Hesap Bilgileriniz:</strong><br>
        📧 E-posta: ${escapeHtml(data.userEmail)}<br>
        👤 Hesap Türü: ${accountLabel}
      </p>
    </div>
    
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #166534;">
        <strong>Sonraki adımlar:</strong><br>
        • Profilinizi tamamlayın<br>
        • Platformu keşfedin<br>
        • Topluluğumuza katılın
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.AUTH_URL || 'http://localhost:3000'}/dashboard" 
         style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Dashboard'a Git
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      Herhangi bir sorunuz varsa destek ekibimizle iletişime geçebilirsiniz.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p>
  </div>
</body>
</html>
  `.trim();
}

// ─── Feedback Email Templates ────────────────────────────────────

/**
 * Email template: Thank you for feedback
 */
export function renderFeedbackThankYouEmail(data: {
  userName: string;
  message: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">💜 Geri Bildiriminiz İçin Teşekkürler!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Merhaba ${escapeHtml(data.userName)},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Değerli geri bildiriminizi aldık. Görüşleriniz bizim için çok önemli ve platformumuzu geliştirmemize yardımcı oluyor.
    </p>
    
    <div style="background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #6b21a8;">
        <strong>Gönderdiğiniz mesaj:</strong><br>
        <em style="color: #7c3aed;">"${escapeHtml(data.message).substring(0, 300)}${data.message.length > 300 ? '...' : ''}"</em>
      </p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Ekibimiz geri bildiriminizi inceleyecek ve gerekli adımları atacaktır.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.AUTH_URL || 'http://localhost:3000'}" 
         style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        FundEd'e Dön
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      Desteğiniz için teşekkür ederiz. 🙏
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email template: Admin notification for new feedback
 */
export function renderFeedbackNotificationEmail(data: {
  userName: string;
  userEmail: string;
  message: string;
  rating?: number;
}): string {
  const ratingStars = data.rating ? '⭐'.repeat(data.rating) + '☆'.repeat(5 - data.rating) : 'Belirtilmedi';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1e293b; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📩 Yeni Geri Bildirim</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Merhaba Admin,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Yeni bir geri bildirim alındı:
    </p>
    
    <div style="background: #f8fafc; border-left: 4px solid #1e293b; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #334155;">
        <strong>Gönderen:</strong> ${escapeHtml(data.userName)}<br>
        <strong>E-posta:</strong> ${escapeHtml(data.userEmail)}<br>
        <strong>Puan:</strong> ${ratingStars}<br>
        <strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}
      </p>
    </div>
    
    <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #475569;">
        <strong>Mesaj:</strong><br>
        ${escapeHtml(data.message)}
      </p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      Bu bildirim otomatik olarak gönderilmiştir.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p>
  </div>
</body>
</html>
  `.trim();
}

// ─── Tribute Giving Email Templates ─────────────────────────────────────────

/**
 * Email sent to the DONOR confirming a tribute donation.
 * Subject: "X adına bağışınız tamamlandı 💙"
 */
export function renderTributeDonorConfirmEmail(data: {
  donorName: string;
  honoreeName: string;
  occasionLabel: string;
  occasionEmoji: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  campaignId: string;
  message: string;
  honoreeEmail?: string;
}): string {
  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
  const symMap: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
  const sym = symMap[data.currency?.toUpperCase()] ?? data.currency;
  const fmtAmount =
    data.currency?.toUpperCase() === 'TRY'
      ? `${data.amount.toLocaleString('tr-TR')}${sym}`
      : `${sym}${data.amount.toLocaleString('en-US')}`;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 36px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <div style="font-size: 44px; margin-bottom: 10px;">${escapeHtml(data.occasionEmoji)}</div>
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Tribute Bağışınız Tamamlandı!</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">${escapeHtml(data.honoreeName)} adına bir öğrenciye destek oldunuz</p>
  </div>
  <div style="background: #ffffff; padding: 32px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin: 0 0 20px;">Sayın <strong>${escapeHtml(data.donorName)}</strong>,</p>
    <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">
      <strong>${escapeHtml(data.honoreeName)}</strong> adına yaptığınız <strong>${escapeHtml(data.occasionLabel)}</strong> bağışı başarıyla tamamlandı.
    </p>
    <div style="background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 42%;">Onurlandırılan Kişi</td><td style="font-weight: 600; font-size: 14px;">${escapeHtml(data.honoreeName)}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Özel Gün</td><td style="font-weight: 600; font-size: 14px;">${escapeHtml(data.occasionEmoji)} ${escapeHtml(data.occasionLabel)}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Bağış Tutarı</td><td style="font-weight: 700; font-size: 16px; color: #2563eb;">${escapeHtml(fmtAmount)}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Kampanya</td><td style="font-size: 14px;">${escapeHtml(data.campaignTitle)}</td></tr>
        ${data.honoreeEmail ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Bildirim Gönderildi</td><td style="font-size: 14px; color: #059669;">✓ ${escapeHtml(data.honoreeEmail)}</td></tr>` : ''}
      </table>
    </div>
    ${data.message ? `
    <div style="background: #fafafa; border-left: 4px solid #6366f1; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 0 0 24px;">
      <p style="margin: 0 0 6px; font-size: 12px; color: #9ca3af; text-transform: uppercase;">Mesajınız</p>
      <p style="margin: 0; font-size: 14px; color: #374151; font-style: italic;">"${escapeHtml(data.message)}"</p>
    </div>` : ''}
    <div style="text-align: center; margin: 28px 0 8px;">
      <a href="${baseUrl}/campaign/${escapeHtml(data.campaignId)}" style="display: inline-block; background: #3b82f6; color: white; padding: 13px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Kampanyayı Görüntüle</a>
    </div>
    <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
      Sorularınız için <a href="mailto:support@fund-ed.com" style="color: #3b82f6;">support@fund-ed.com</a>
    </p>
  </div>
  <div style="text-align: center; margin-top: 16px; color: #9ca3af; font-size: 12px;"><p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p></div>
</body>
</html>
  `.trim();
}

/**
 * Email sent to the HONOREE notifying them that someone donated in their name.
 * Subject: "Sevdikleriniz sizin adınıza bir öğrenciye destek oldu 💙"
 */
export function renderTributeHonoreeNotificationEmail(data: {
  honoreeName: string;
  donorName: string;
  occasionLabel: string;
  occasionEmoji: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  campaignId: string;
  message: string;
}): string {
  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
  const symMap: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
  const sym = symMap[data.currency?.toUpperCase()] ?? data.currency;
  const fmtAmount =
    data.currency?.toUpperCase() === 'TRY'
      ? `${data.amount.toLocaleString('tr-TR')}${sym}`
      : `${sym}${data.amount.toLocaleString('en-US')}`;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 36px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <div style="font-size: 44px; margin-bottom: 10px;">🎁</div>
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Sizi Düşündüler!</h1>
    <p style="color: rgba(255,255,255,0.87); margin: 8px 0 0; font-size: 15px;">${escapeHtml(data.occasionEmoji)} ${escapeHtml(data.occasionLabel)} vesilesiyle size özel bir hediye var</p>
  </div>
  <div style="background: #ffffff; padding: 32px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin: 0 0 20px;">Sayın <strong>${escapeHtml(data.honoreeName)}</strong>,</p>
    <p style="font-size: 15px; color: #374151; margin: 0 0 8px;">
      <strong>${escapeHtml(data.donorName)}</strong>, sizin adınıza bir öğrencinin eğitim hayaline destek oldu 💙
    </p>
    <div style="background: linear-gradient(135deg, #ecfdf5, #eff6ff); border: 1px solid #a7f3d0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280; text-transform: uppercase;">Bağış Tutarı</p>
      <p style="margin: 0; font-size: 36px; font-weight: 800; color: #1d4ed8;">${escapeHtml(fmtAmount)}</p>
      <p style="margin: 8px 0 0; font-size: 14px; color: #374151;">${escapeHtml(data.campaignTitle)}</p>
    </div>
    ${data.message ? `
    <div style="background: #fdf4ff; border: 1px solid #e9d5ff; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af; text-transform: uppercase;">${escapeHtml(data.donorName)}&#39;ın Size Özel Mesajı</p>
      <p style="margin: 0; font-size: 15px; color: #374151; font-style: italic;">"${escapeHtml(data.message)}"</p>
    </div>` : ''}
    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 0 0 24px;">
      <p style="margin: 0; font-size: 13px; color: #475569;">
        Bu bağış, FundEd platformu üzerinden gerçek bir öğrencinin eğitim kampanyasına yönlendirilmiştir.
        <a href="${baseUrl}/campaign/${escapeHtml(data.campaignId)}" style="color: #3b82f6; font-weight: 600;">Kampanyayı buradan görebilirsiniz.</a>
      </p>
    </div>
    <div style="text-align: center; margin: 28px 0 8px;">
      <a href="${baseUrl}/campaign/${escapeHtml(data.campaignId)}" style="display: inline-block; background: #10b981; color: white; padding: 13px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Kampanyayı Gör</a>
    </div>
    <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
      Bu e-postayı yanlışlıkla aldıysanız lütfen dikkate almayınız.
      Sorularınız için <a href="mailto:support@fund-ed.com" style="color: #3b82f6;">support@fund-ed.com</a>
    </p>
  </div>
  <div style="text-align: center; margin-top: 16px; color: #9ca3af; font-size: 12px;"><p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p></div>
</body>
</html>
  `.trim();
}

// ─── Subscription Email Templates ────────────────────────────────────────────

/**
 * Email template: Subscription created
 */
export function renderSubscriptionCreatedEmail(data: {
  donorName: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  campaignId: string;
  interval: string;
  nextBillingDate: string;
}): string {
  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
  const formattedAmount = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: data.currency || 'TRY',
  }).format(data.amount);
  const intervalLabel = data.interval === 'monthly' ? 'Aylık' : data.interval === 'quarterly' ? '3 Aylık' : 'Yıllık';

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Düzenli Bağış Aktif!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Merhaba ${escapeHtml(data.donorName)},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Düzenli bağış aboneliğiniz başarıyla oluşturuldu. Bir öğrencinin eğitim yolculuğuna sürekli destek verdiğiniz için teşekkür ederiz!</p>
    <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6d28d9;"><strong>Kampanya:</strong> ${escapeHtml(data.campaignTitle)}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6d28d9;"><strong>Tutar:</strong> ${formattedAmount} / ${intervalLabel}</p>
      <p style="margin: 0; font-size: 14px; color: #6d28d9;"><strong>Sonraki çekim:</strong> ${escapeHtml(data.nextBillingDate)}</p>
    </div>
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">Aboneliğinizi istediğiniz zaman dashboard üzerinden iptal edebilir veya duraklatabilirsiniz.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/donor/subscriptions" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Aboneliklerimi Yönet</a>
    </div>
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">Sorularınız için <a href="mailto:support@fund-ed.com" style="color: #7c3aed;">support@fund-ed.com</a></p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;"><p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p></div>
</body></html>
  `.trim();
}

/**
 * Email template: Subscription renewal success (sent to donor)
 */
export function renderSubscriptionRenewalEmail(data: {
  donorName: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  campaignId: string;
  paymentDate: string;
  nextBillingDate: string;
  totalDonated: number;
}): string {
  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
  const formattedAmount = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: data.currency || 'TRY' }).format(data.amount);
  const formattedTotal = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: data.currency || 'TRY' }).format(data.totalDonated);

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">💝 Aylık Bağışınız Tamamlandı!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Merhaba ${escapeHtml(data.donorName)},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Düzenli bağışınız başarıyla tahsil edildi. Sürekli desteğiniz için teşekkür ederiz!</p>
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #065f46;"><strong>Kampanya:</strong> ${escapeHtml(data.campaignTitle)}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #065f46;"><strong>Bu ay çekilen:</strong> ${formattedAmount}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #065f46;"><strong>Toplam bağışınız:</strong> ${formattedTotal}</p>
      <p style="margin: 0; font-size: 14px; color: #065f46;"><strong>Sonraki çekim:</strong> ${escapeHtml(data.nextBillingDate)}</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/campaign/${escapeHtml(data.campaignId)}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Kampanyayı Gör</a>
    </div>
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">Aboneliğinizi yönetmek için <a href="${baseUrl}/donor/subscriptions" style="color: #10b981;">buraya tıklayın</a>.</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;"><p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p></div>
</body></html>
  `.trim();
}

/**
 * Email template: Recurring donation notification (sent to student)
 */
export function renderStudentRecurringDonationEmail(data: {
  studentName: string;
  donorName: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  campaignId: string;
  anonymous: boolean;
}): string {
  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
  const formattedAmount = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: data.currency || 'TRY' }).format(data.amount);
  const displayDonor = data.anonymous ? 'Anonim Bağışçı' : escapeHtml(data.donorName);

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Yeni Düzenli Bağış Alındı!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Merhaba ${escapeHtml(data.studentName)},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Harika haber! <strong>${displayDonor}</strong> kampanyanıza <strong>${formattedAmount}</strong> tutarında düzenli aylık bağış yaptı!</p>
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">Bu bağışçı her ay otomatik olarak kampanyanıza destek vermeye devam edecek. 🌟</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/campaign/${escapeHtml(data.campaignId)}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Kampanyamı Gör</a>
    </div>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;"><p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p></div>
</body></html>
  `.trim();
}

/**
 * Email template: Payment failed retry (sent to donor)
 */
export function renderPaymentFailedEmail(data: {
  donorName: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  retryCount: number;
  maxRetries: number;
}): string {
  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
  const formattedAmount = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: data.currency || 'TRY' }).format(data.amount);
  const remainingRetries = data.maxRetries - data.retryCount;

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ef4444; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Ödeme Başarısız</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Merhaba ${escapeHtml(data.donorName)},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">"<strong>${escapeHtml(data.campaignTitle)}</strong>" kampanyasına olan <strong>${formattedAmount}</strong> tutarındaki düzenli bağışınızın tahsilatı başarısız oldu.</p>
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;"><strong>Olası nedenler:</strong><br>• Kartınızda yeterli bakiye olmayabilir<br>• Kart bilgileriniz güncel olmayabilir<br>• Bankanız işlemi reddetmiş olabilir</p>
    </div>
    ${remainingRetries > 0 ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">Sistem <strong>${remainingRetries}</strong> kez daha deneyecek. Bu sürede kart bilgilerinizi güncelleyebilirsiniz.</p>` : `<p style="font-size: 14px; color: #991b1b; margin-bottom: 20px;"><strong>Tüm deneme hakları kullanıldı.</strong> Aboneliğiniz askıya alındı. Lütfen kart bilgilerinizi güncelledikten sonra aboneliğinizi yeniden başlatın.</p>`}
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/donor/subscriptions" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Aboneliğimi Güncelle</a>
    </div>
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">Yardıma mı ihtiyacınız var? <a href="mailto:support@fund-ed.com" style="color: #3b82f6;">support@fund-ed.com</a></p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;"><p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p></div>
</body></html>
  `.trim();
}

/**
 * Email template: Subscription cancelled
 */
export function renderSubscriptionCancelledEmail(data: {
  donorName: string;
  campaignTitle: string;
  totalDonated: number;
  currency: string;
  totalPayments: number;
}): string {
  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
  const formattedTotal = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: data.currency || 'TRY' }).format(data.totalDonated);

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Abonelik İptal Edildi</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Merhaba ${escapeHtml(data.donorName)},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">"<strong>${escapeHtml(data.campaignTitle)}</strong>" kampanyasına olan düzenli bağış aboneliğiniz iptal edildi.</p>
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e40af;"><strong>Toplam katkınız:</strong> ${formattedTotal}</p>
      <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Toplam ödeme sayısı:</strong> ${data.totalPayments}</p>
    </div>
    <p style="font-size: 16px; margin-bottom: 20px;">Desteğiniz bir öğrencinin hayatında fark yarattı. Tekrar bağış yapmak isterseniz sizi her zaman bekleriz! 💜</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/campaigns" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Kampanyaları Keşfet</a>
    </div>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;"><p>© ${new Date().getFullYear()} FundEd. Tüm hakları saklıdır.</p></div>
</body></html>
  `.trim();
}