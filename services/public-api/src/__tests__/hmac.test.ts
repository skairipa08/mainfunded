import { describe, it, expect } from 'vitest';
import { sign, verify } from '../lib/hmac';

describe('HMAC sign/verify', () => {
  const secret = 'whsec_test_xxxxxxxxxxxxxxxxxxxxxxxx';
  const body = JSON.stringify({ event: 'donation.created', data: { id: 'd_1' } });

  it('round-trips — signed body verifies', () => {
    const sig = sign(body, secret);
    expect(verify(body, sig, secret).ok).toBe(true);
  });

  it('rejects when body is tampered', () => {
    const sig = sign(body, secret);
    const result = verify(body + 'x', sig, secret);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('mismatch');
  });

  it('rejects when secret is wrong', () => {
    const sig = sign(body, secret);
    expect(verify(body, sig, 'whsec_other').ok).toBe(false);
  });

  it('rejects stale signature (>5min)', () => {
    const oldTs = Math.floor(Date.now() / 1000) - 600;
    const sig = sign(body, secret, oldTs);
    const result = verify(body, sig, secret);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('stale');
  });

  it('rejects malformed header', () => {
    expect(verify(body, undefined, secret).reason).toBe('malformed');
    expect(verify(body, 'garbage', secret).reason).toBe('malformed');
  });
});
