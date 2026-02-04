/**
 * SMS Verification Service
 * Handles SMS verification for phone numbers using Twilio
 */

interface SMSResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// In-memory store for verification codes (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: number; attempts: number }>();

/**
 * Generate a 6-digit verification code
 */
function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string, countryCode: string = '+90'): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // If starts with 0, remove it
    const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;

    // Add country code if not present
    if (!phone.startsWith('+')) {
        return `${countryCode}${withoutLeadingZero}`;
    }

    return phone;
}

/**
 * Send SMS using Twilio API
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        console.log('[SMS] Twilio not configured, logging message instead:');
        console.log(`To: ${to}`);
        console.log(`Message: ${message}`);
        return { success: true, messageId: 'demo-' + Date.now() };
    }

    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                To: to,
                From: TWILIO_PHONE_NUMBER,
                Body: message,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        const data = await response.json();
        return { success: true, messageId: data.sid };
    } catch (error) {
        console.error('[SMS] Failed to send:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Send verification code to phone number
 */
export async function sendVerificationCode(phone: string): Promise<{ success: boolean; error?: string }> {
    const formattedPhone = formatPhoneNumber(phone);
    const code = generateVerificationCode();

    // Store the code with 10 minute expiration
    verificationCodes.set(formattedPhone, {
        code,
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
        attempts: 0,
    });

    const message = `FundEd doğrulama kodunuz: ${code}\n\nBu kodu kimseyle paylaşmayın. Kod 10 dakika geçerlidir.`;

    const result = await sendSMS(formattedPhone, message);

    if (!result.success) {
        verificationCodes.delete(formattedPhone);
        return { success: false, error: 'SMS gönderilemedi. Lütfen tekrar deneyin.' };
    }

    return { success: true };
}

/**
 * Verify the code entered by user
 */
export function verifyCode(phone: string, code: string): { success: boolean; error?: string } {
    const formattedPhone = formatPhoneNumber(phone);
    const entry = verificationCodes.get(formattedPhone);

    if (!entry) {
        return { success: false, error: 'Doğrulama kodu bulunamadı. Lütfen yeni kod isteyin.' };
    }

    // Check expiration
    if (Date.now() > entry.expires) {
        verificationCodes.delete(formattedPhone);
        return { success: false, error: 'Doğrulama kodu süresi doldu. Lütfen yeni kod isteyin.' };
    }

    // Check attempts (max 3)
    if (entry.attempts >= 3) {
        verificationCodes.delete(formattedPhone);
        return { success: false, error: 'Çok fazla hatalı deneme. Lütfen yeni kod isteyin.' };
    }

    // Increment attempts
    entry.attempts++;

    // Verify code
    if (entry.code !== code) {
        return { success: false, error: `Hatalı kod. ${3 - entry.attempts} deneme hakkınız kaldı.` };
    }

    // Success - remove the code
    verificationCodes.delete(formattedPhone);
    return { success: true };
}

/**
 * Check if verification is pending for a phone number
 */
export function hasPendingVerification(phone: string): boolean {
    const formattedPhone = formatPhoneNumber(phone);
    const entry = verificationCodes.get(formattedPhone);

    if (!entry) return false;
    if (Date.now() > entry.expires) {
        verificationCodes.delete(formattedPhone);
        return false;
    }

    return true;
}

/**
 * Get remaining time for verification code
 */
export function getVerificationExpiry(phone: string): number | null {
    const formattedPhone = formatPhoneNumber(phone);
    const entry = verificationCodes.get(formattedPhone);

    if (!entry || Date.now() > entry.expires) return null;

    return Math.ceil((entry.expires - Date.now()) / 1000); // seconds remaining
}

/**
 * SMS Templates
 */
export const SMSTemplates = {
    verification: (code: string) =>
        `FundEd doğrulama kodunuz: ${code}\nBu kodu kimseyle paylaşmayın. 10 dk geçerli.`,

    donationReceived: (amount: number, studentName: string) =>
        `🎉 FundEd: ${studentName} için ${amount} TL bağış aldınız! Detaylar için uygulamayı açın.`,

    campaignApproved: (campaignTitle: string) =>
        `✅ FundEd: "${campaignTitle}" kampanyanız onaylandı ve yayında!`,

    reminder: (message: string) =>
        `📢 FundEd: ${message}`,

    welcome: (name: string) =>
        `👋 Merhaba ${name}! FundEd'e hoş geldiniz. Eğitim hayallerinizi gerçekleştirmek için buradayız!`,
};

/**
 * Validate Turkish phone number
 */
export function isValidTurkishPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');

    // Turkish mobile numbers: 5XX XXX XX XX (10 digits) or 05XX XXX XX XX (11 digits)
    if (cleaned.length === 10 && cleaned.startsWith('5')) return true;
    if (cleaned.length === 11 && cleaned.startsWith('05')) return true;
    if (cleaned.length === 12 && cleaned.startsWith('905')) return true;
    if (cleaned.length === 13 && cleaned.startsWith('+905')) return true;

    return false;
}
