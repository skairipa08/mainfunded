import { randomBytes } from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit 0/O/1/I for clarity
const CODE_LENGTH = 8;

export function generateActivationCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function isValidActivationCodeShape(code: string): boolean {
  return /^[A-HJ-NP-Z2-9]{8}$/.test(code);
}
