import { describe, it, expect } from 'vitest';
import { render } from '@react-email/render';
import {
  BudgetThreshold80Email,
  BudgetThresholdReachedEmail,
} from '../../../lib/corporate/email-templates';

describe('BudgetThreshold80Email', () => {
  it('renders company name, period, and 80%', async () => {
    const html = await render(
      BudgetThreshold80Email({
        companyName: 'Acme Corp',
        periodKey: '2026-05',
        spentTRY: 80_000,
        limitTRY: 100_000,
      })
    );
    expect(html).toContain('Acme Corp');
    expect(html).toContain('2026-05');
    expect(html).toContain('%80');
    expect(html).toContain('100.000');
    expect(html).toContain('80.000');
  });
});

describe('BudgetThresholdReachedEmail', () => {
  it('renders company name and period', async () => {
    const html = await render(
      BudgetThresholdReachedEmail({
        companyName: 'Acme Corp',
        periodKey: '2026-05',
        limitTRY: 100_000,
      })
    );
    expect(html).toContain('Acme Corp');
    expect(html).toContain('2026-05');
  });
});
