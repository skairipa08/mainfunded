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

export function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount > 1000000) {
    return { valid: false, error: 'Amount cannot exceed $1,000,000' };
  }
  if (amount < 1) {
    return { valid: false, error: 'Minimum donation amount is $1' };
  }
  return { valid: true };
}
