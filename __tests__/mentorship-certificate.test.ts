import { describe, expect, it } from 'vitest';
import { generateMentorCertificatePdf } from '@/lib/mentorship/certificate';

describe('Mentor certificate PDF', () => {
  it('generates a non-empty PDF document', () => {
    const pdf = generateMentorCertificatePdf({
      mentorName: 'Test Mentor',
      year: 2026,
      totalHours: 42,
      issueDate: new Date('2026-05-08T00:00:00.000Z'),
    });

    expect(pdf.byteLength).toBeGreaterThan(1000);
  });
});
