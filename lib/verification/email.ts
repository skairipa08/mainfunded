/**
 * Verification Email Service
 * 
 * Send status change notifications to students
 */

import { sendEmail } from '@/lib/email';
import { VerificationStatusType, DocumentType } from '@/types/verification';

const BASE_URL = process.env.AUTH_URL || 'http://localhost:3000';

interface VerificationEmailData {
    userId: string;
    userEmail: string;
    userName: string;
    status: VerificationStatusType;
    reason?: string;
    reasonCode?: string;
    requestedDocuments?: DocumentType[];
    message?: string;
}

/**
 * Send verification status change email
 */
export async function sendVerificationStatusEmail(data: VerificationEmailData): Promise<boolean> {
    const template = getEmailTemplate(data);
    if (!template) return false;

    return sendEmail({
        to: data.userEmail,
        subject: template.subject,
        html: template.html
    });
}

function getEmailTemplate(data: VerificationEmailData): { subject: string; html: string } | null {
    switch (data.status) {
        case 'APPROVED':
            return {
                subject: '🎓 Your FundEd Verification is Approved!',
                html: renderApprovedEmail(data)
            };
        case 'REJECTED':
            return {
                subject: 'FundEd Verification Update',
                html: renderRejectedEmail(data)
            };
        case 'NEEDS_MORE_INFO':
            return {
                subject: 'Action Required: Additional Documents Needed',
                html: renderNeedsMoreInfoEmail(data)
            };
        case 'SUSPENDED':
            return {
                subject: 'FundEd Account Suspended',
                html: renderSuspendedEmail(data)
            };
        case 'REVOKED':
            return {
                subject: 'FundEd Verification Revoked',
                html: renderRevokedEmail(data)
            };
        case 'PENDING_REVIEW':
            return {
                subject: 'Verification Submitted - Under Review',
                html: renderSubmittedEmail(data)
            };
        default:
            return null;
    }
}

function renderApprovedEmail(data: VerificationEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎓 Verification Approved!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello ${data.userName || 'Student'},</p>
    
    <p>Great news! Your student verification has been <strong>approved</strong>.</p>
    
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #065f46;">
        <strong>You can now:</strong><br>
        ✓ Create fundraising campaigns<br>
        ✓ Receive donations from supporters<br>
        ✓ Access all verified student features
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/dashboard" 
         style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Go to Dashboard
      </a>
    </div>
    
    <p style="font-size: 12px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      Your verification is valid for 1 year. You'll receive a reminder before it expires.
    </p>
  </div>
</body>
</html>
  `.trim();
}

function renderRejectedEmail(data: VerificationEmailData): string {
    const reasonText = data.reason || getReasonText(data.reasonCode);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ef4444; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Verification Not Approved</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello ${data.userName || 'Student'},</p>
    
    <p>We've reviewed your verification request. Unfortunately, we're unable to approve it at this time.</p>
    
    ${reasonText ? `
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        <strong>Reason:</strong><br>
        ${reasonText}
      </p>
    </div>
    ` : ''}
    
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>You can reapply after 7 days</strong><br>
        Please review the rejection reason and ensure all documents are valid before reapplying.
      </p>
    </div>
    
    <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
      If you believe this is an error, please contact support.
    </p>
  </div>
</body>
</html>
  `.trim();
}

function renderNeedsMoreInfoEmail(data: VerificationEmailData): string {
    const docList = data.requestedDocuments?.map(d => `• ${formatDocType(d)}`).join('<br>') || '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f59e0b; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📎 Additional Documents Needed</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello ${data.userName || 'Student'},</p>
    
    <p>We need additional information to complete your verification.</p>
    
    ${docList ? `
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Please upload:</strong><br>
        ${docList}
      </p>
    </div>
    ` : ''}
    
    ${data.message ? `<p><strong>Message from reviewer:</strong><br>${data.message}</p>` : ''}
    
    <div style="background: #fef2f2; padding: 15px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        ⏰ <strong>Please respond within 14 days</strong> to avoid having your application marked as abandoned.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/apply" 
         style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Upload Documents
      </a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function renderSuspendedEmail(data: VerificationEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ef4444; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Account Suspended</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello ${data.userName || 'Student'},</p>
    <p>Your FundEd account has been temporarily suspended.</p>
    ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
    <p>Your active campaigns are paused and pending payouts are on hold.</p>
    <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
      If you believe this is an error, please contact support immediately.
    </p>
  </div>
</body>
</html>
  `.trim();
}

function renderRevokedEmail(data: VerificationEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #7f1d1d; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Verification Revoked</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello ${data.userName || 'Student'},</p>
    <p>Your student verification has been permanently revoked.</p>
    ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
    <p>All active campaigns have been cancelled. You are no longer eligible to use FundEd.</p>
  </div>
</body>
</html>
  `.trim();
}

function renderSubmittedEmail(data: VerificationEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📋 Verification Submitted</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello ${data.userName || 'Student'},</p>
    <p>Thank you for submitting your verification. Our team will review your application within <strong>24-48 hours</strong>.</p>
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>What happens next?</strong><br>
        • We'll verify your documents<br>
        • You'll receive an email with the result<br>
        • Once approved, you can create campaigns
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getReasonText(code?: string): string {
    const reasons: Record<string, string> = {
        'DOCUMENT_UNREADABLE': 'One or more documents could not be read clearly.',
        'DOCUMENT_EXPIRED': 'The submitted documents have expired.',
        'DOCUMENT_MISMATCH': 'The information in documents does not match your profile.',
        'INSTITUTION_UNVERIFIABLE': 'We could not verify your educational institution.',
        'ENROLLMENT_NOT_CONFIRMED': 'We could not confirm your active enrollment status.',
        'IDENTITY_MISMATCH': 'The selfie verification did not match your ID.',
        'SUSPECTED_FRAUD': 'Your application was flagged for suspicious activity.',
        'DUPLICATE_ACCOUNT': 'A duplicate account was detected.',
        'POLICY_VIOLATION': 'Your application violates our platform policies.',
        'AGE_REQUIREMENT': 'You do not meet our age requirements (16-35).',
    };
    return code ? reasons[code] || '' : '';
}

function formatDocType(type: DocumentType): string {
    const names: Record<DocumentType, string> = {
        'STUDENT_ID': 'Student ID Card',
        'ENROLLMENT_LETTER': 'Enrollment Letter (within 90 days)',
        'GOVERNMENT_ID': 'Government-issued ID',
        'SELFIE_WITH_ID': 'Selfie holding your ID',
        'TRANSCRIPT': 'Academic Transcript',
        'PROOF_OF_ADDRESS': 'Proof of Address',
        'OTHER': 'Additional Document'
    };
    return names[type] || type;
}
