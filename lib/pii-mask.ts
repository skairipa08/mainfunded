/**
 * PII Masking Utilities
 *
 * Masks personally identifiable information before logging.
 * Used across API routes, email, SMS, and audit modules.
 *
 * Rules:
 *  - Email: show first 2 chars + domain  → ba***@gmail.com
 *  - Phone: show last 4 digits           → ***1234
 *  - Name:  show first char + asterisks   → B***
 *  - IP:    show first octet             → 192.***
 *  - Generic: replace middle chars        → ab***yz
 */

/**
 * Mask an email address: first 2 chars + *** + @domain
 */
export function maskEmail(email: string | undefined | null): string {
  if (!email) return '***';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.substring(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * Mask a phone number: show last 4 digits only
 */
export function maskPhone(phone: string | undefined | null): string {
  if (!phone) return '***';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '***';
  return `***${digits.slice(-4)}`;
}

/**
 * Mask a person's name: show first character + ***
 */
export function maskName(name: string | undefined | null): string {
  if (!name) return '***';
  return name.charAt(0) + '***';
}

/**
 * Mask an IP address: show first octet only (IPv4)
 * For IPv6, show first group.
 */
export function maskIp(ip: string | undefined | null): string {
  if (!ip) return '***';
  if (ip.includes('.')) {
    return ip.split('.')[0] + '.***';
  }
  // IPv6
  return ip.split(':')[0] + ':***';
}

/**
 * Generic string masking: show first 2 and last 2 chars
 */
export function maskString(value: string | undefined | null, showChars = 2): string {
  if (!value) return '***';
  if (value.length <= showChars * 2) return '***';
  return value.substring(0, showChars) + '***' + value.substring(value.length - showChars);
}

/**
 * Auto-detect and mask PII in an object's values (shallow).
 * Looks for keys containing email, phone, name, ip, etc.
 */
export function maskPiiFields<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== 'string') {
      result[key] = value;
      continue;
    }
    const lk = key.toLowerCase();
    if (lk.includes('email') || lk === 'to' || lk === 'from') {
      result[key] = maskEmail(value);
    } else if (lk.includes('phone') || lk.includes('tel') || lk.includes('mobile')) {
      result[key] = maskPhone(value);
    } else if (lk.includes('name') && !lk.includes('filename') && !lk.includes('hostname')) {
      result[key] = maskName(value);
    } else if (lk === 'ip' || lk.includes('ip_address')) {
      result[key] = maskIp(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
