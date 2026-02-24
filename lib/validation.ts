/**
 * Validation utilities for forms
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function sanitizeInput(input: string): string {
  // Basic sanitization - remove potentially dangerous characters
  return input.trim().replace(/[<>]/g, '');
}

export function validateAmount(amount: number, currency: string = 'USD'): { valid: boolean; error?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount > 1000000) {
    return { valid: false, error: 'Amount cannot exceed 1,000,000' };
  }
  const minAmount = currency === 'TRY' ? 100 : 10;
  if (amount < minAmount) {
    const symbol = currency === 'TRY' ? '₺' : '$';
    return { valid: false, error: `Minimum donation amount is ${symbol}${minAmount}` };
  }
  return { valid: true };
}
