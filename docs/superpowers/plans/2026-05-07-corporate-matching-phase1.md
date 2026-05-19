# Corporate Matching System — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the data layer, self-service company onboarding, admin approval workflow, matching rule CRUD, and a pure matching engine with simulate API — the foundation for Phases 2 and 3.

**Architecture:** Hybrid Prisma (new `Company`, `MatchingRule` models in `prisma/schema.prisma`; existing `User` collection stays MongoDB-native). Pure side-effect-free `simulate()` function with thin API wrapper. NextAuth JWT stamped with `companyId` + `companyStatus` on sign-in to avoid per-request DB lookups. Test isolation via `vi.mock('../lib/prisma')` matching the established pattern in `__tests__/`.

**Tech Stack:** Next.js 14 App Router, MongoDB, Prisma 5, NextAuth v5 (JWT strategy, Credentials provider), zod, react-hook-form, @react-email/components, vitest, bcryptjs, Resend (templates only — not triggered in Phase 1).

**Spec:** [docs/superpowers/specs/2026-05-07-corporate-matching-phase1-design.md](../specs/2026-05-07-corporate-matching-phase1-design.md)

**Role naming convention:** Existing User collection uses lowercase string roles (`'user' | 'admin'`, see [auth.ts:166](../../../auth.ts#L166)). Phase 1 adds `'company_owner'` to the union — same lowercase pattern. The spec's `COMPANY_OWNER` is a label; the wire value is `'company_owner'`.

---

## Chunk 1: Foundation (schema, types, validators, period helper)

### Task 1: Confirm test isolation pattern (1 minute)

The spec already pre-decided this — confirm in 60 seconds and move on.

- [ ] **Step 1: Read `__tests__/authz.test.ts:1-20`**

Confirm the established pattern is: `vi.mock('../auth', () => ({ auth: vi.fn() }))` and `vi.mock('../lib/db', ...)`. Our Prisma-backed code follows the analogous shape: `vi.mock('../lib/prisma', () => ({ prisma: {...} }))`. No new test infrastructure. Proceed to Task 2.

---

### Task 2: Add Company + MatchingRule to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma` (append at end of file)
- Run: `npx prisma generate`

- [ ] **Step 1: Append models to schema**

Append to `prisma/schema.prisma` after the last existing model:

```prisma
model Company {
  id              String          @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  legalName       String?
  taxId           String          @unique
  logoUrl         String?
  contactEmail    String
  contactPhone    String?
  websiteUrl      String?
  ownerUserId     String          @unique
  status          CompanyStatus   @default(PENDING)
  approvedAt      DateTime?
  approvedBy      String?
  rejectedReason  String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  matchingRule    MatchingRule?

  @@index([ownerUserId])
  @@index([status])
  @@map("companies")
}

enum CompanyStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

model MatchingRule {
  id                  String    @id @default(auto()) @map("_id") @db.ObjectId
  companyId           String    @unique @db.ObjectId
  company             Company   @relation(fields: [companyId], references: [id])
  ratio               Int
  monthlyBudgetTRY    Int
  eligibleCategories  String[]
  active              Boolean   @default(true)
  effectiveFrom       DateTime  @default(now())
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@map("matching_rules")
}
```

- [ ] **Step 2: Generate Prisma client**

Run: `npx prisma generate`
Expected: "✔ Generated Prisma Client" — no errors. New `Company` and `MatchingRule` types available in `@prisma/client`.

- [ ] **Step 3: TypeScript sanity check**

Run: `npx tsc --noEmit`
Expected: No new errors introduced. (Pre-existing errors in unrelated files are acceptable; flag if a new error references Company/MatchingRule.)

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(corporate): add Company and MatchingRule Prisma models"
```

---

### Task 3: Create shared types module

**Files:**
- Create: `lib/corporate/types.ts`

- [ ] **Step 1: Write the file**

```ts
// lib/corporate/types.ts
import type { MatchingRule } from '@prisma/client';

export const ELIGIBLE_CATEGORIES = [
  'tuition',
  'books',
  'laptop',
  'housing',
  'travel',
  'emergency',
] as const;

export type EligibleCategory = (typeof ELIGIBLE_CATEGORIES)[number];

export type SimulateInput = {
  donationAmountTRY: number;
  category: string;
  rule: MatchingRule;
  spentInPeriodTRY: number;
};

export type SimulateRejectReason =
  | 'RULE_INACTIVE'
  | 'CATEGORY_INELIGIBLE'
  | 'BUDGET_EXHAUSTED'
  | 'INVALID_INPUT';

export type SimulateResult =
  | {
      matched: true;
      matchedAmountTRY: number;
      ratioApplied: number;
      remainingBudgetTRY: number;
    }
  | {
      matched: false;
      reason: SimulateRejectReason;
    };
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors in `lib/corporate/types.ts`. (Reading from `@prisma/client` should resolve since Task 2 ran `prisma generate`.)

- [ ] **Step 3: Commit**

```bash
git add lib/corporate/types.ts
git commit -m "feat(corporate): add shared types and category constants"
```

---

### Task 4: Period key helper (TDD)

**Files:**
- Create: `lib/corporate/period.ts`
- Create: `__tests__/lib/corporate/period.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/lib/corporate/period.test.ts
import { describe, it, expect } from 'vitest';
import { periodKey } from '../../../lib/corporate/period';

describe('periodKey (Europe/Istanbul)', () => {
  it('formats a mid-month UTC date as YYYY-MM', () => {
    // 2026-05-15 12:00 UTC → 2026-05-15 15:00 Istanbul → '2026-05'
    expect(periodKey(new Date('2026-05-15T12:00:00Z'))).toBe('2026-05');
  });

  it('respects Istanbul timezone for end-of-month UTC', () => {
    // 2026-05-31 22:30 UTC = 2026-06-01 01:30 Istanbul → '2026-06'
    expect(periodKey(new Date('2026-05-31T22:30:00Z'))).toBe('2026-06');
  });

  it('respects Istanbul timezone for start-of-month UTC', () => {
    // 2026-06-01 00:30 UTC = 2026-06-01 03:30 Istanbul → '2026-06'
    expect(periodKey(new Date('2026-06-01T00:30:00Z'))).toBe('2026-06');
  });

  it('pads single-digit months', () => {
    expect(periodKey(new Date('2026-01-15T12:00:00Z'))).toBe('2026-01');
  });
});
```

- [ ] **Step 2: Run the test — expect FAIL**

Run: `npx vitest run __tests__/lib/corporate/period.test.ts`
Expected: FAIL with "Cannot find module '../../../lib/corporate/period'".

- [ ] **Step 3: Implement**

```ts
// lib/corporate/period.ts
const FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Istanbul',
  year: 'numeric',
  month: '2-digit',
});

export function periodKey(date: Date = new Date()): string {
  const parts = FORMATTER.formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value ?? '0000';
  const month = parts.find((p) => p.type === 'month')?.value ?? '00';
  return `${year}-${month}`;
}
```

- [ ] **Step 4: Run the test — expect PASS**

Run: `npx vitest run __tests__/lib/corporate/period.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/corporate/period.ts __tests__/lib/corporate/period.test.ts
git commit -m "feat(corporate): add Europe/Istanbul period key helper"
```

---

### Task 5: zod validators (TDD)

**Files:**
- Create: `lib/corporate/validators.ts`
- Create: `__tests__/lib/corporate/validators.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// __tests__/lib/corporate/validators.test.ts
import { describe, it, expect } from 'vitest';
import {
  signupSchema,
  matchingRuleSchema,
  simulateSchema,
  profileUpdateSchema,
  approveDecisionSchema,
} from '../../../lib/corporate/validators';

describe('signupSchema', () => {
  const valid = {
    name: 'Acme Corp',
    taxId: '1234567890',
    contactEmail: 'owner@acme.com',
    password: 'StrongPass1!',
  };

  it('accepts a minimal valid payload', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects short password', () => {
    expect(signupSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(signupSchema.safeParse({ ...valid, contactEmail: 'not-an-email' }).success).toBe(false);
  });

  it('rejects empty taxId', () => {
    expect(signupSchema.safeParse({ ...valid, taxId: '' }).success).toBe(false);
  });

  it('rejects empty name', () => {
    expect(signupSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = signupSchema.safeParse({
      ...valid,
      legalName: 'Acme Anonim Şirketi',
      contactPhone: '+905551234567',
      websiteUrl: 'https://acme.com',
      logoUrl: 'https://cdn.example.com/logo.png',
    });
    expect(result.success).toBe(true);
  });
});

describe('matchingRuleSchema', () => {
  it('accepts ratio 1, 2, 3', () => {
    for (const ratio of [1, 2, 3]) {
      expect(
        matchingRuleSchema.safeParse({
          ratio,
          monthlyBudgetTRY: 50000,
          eligibleCategories: ['tuition'],
          active: true,
        }).success
      ).toBe(true);
    }
  });

  it('rejects ratio 0, 4', () => {
    for (const ratio of [0, 4, -1]) {
      expect(
        matchingRuleSchema.safeParse({
          ratio,
          monthlyBudgetTRY: 50000,
          eligibleCategories: ['tuition'],
          active: true,
        }).success
      ).toBe(false);
    }
  });

  it('rejects budget <= 0', () => {
    expect(
      matchingRuleSchema.safeParse({
        ratio: 2,
        monthlyBudgetTRY: 0,
        eligibleCategories: ['tuition'],
        active: true,
      }).success
    ).toBe(false);
  });

  it('rejects unknown category', () => {
    expect(
      matchingRuleSchema.safeParse({
        ratio: 2,
        monthlyBudgetTRY: 50000,
        eligibleCategories: ['unknown'],
        active: true,
      }).success
    ).toBe(false);
  });

  it('rejects empty category list', () => {
    expect(
      matchingRuleSchema.safeParse({
        ratio: 2,
        monthlyBudgetTRY: 50000,
        eligibleCategories: [],
        active: true,
      }).success
    ).toBe(false);
  });
});

describe('simulateSchema', () => {
  it('accepts valid body', () => {
    expect(
      simulateSchema.safeParse({ donationAmountTRY: 500, category: 'tuition' }).success
    ).toBe(true);
  });

  it('rejects negative amount', () => {
    expect(
      simulateSchema.safeParse({ donationAmountTRY: -1, category: 'tuition' }).success
    ).toBe(false);
  });

  it('rejects unknown category', () => {
    expect(
      simulateSchema.safeParse({ donationAmountTRY: 500, category: 'foo' }).success
    ).toBe(false);
  });
});

describe('profileUpdateSchema (PATCH /me allow-list)', () => {
  it('accepts mutable fields', () => {
    expect(
      profileUpdateSchema.safeParse({
        name: 'New Name',
        contactEmail: 'new@acme.com',
      }).success
    ).toBe(true);
  });

  it('rejects taxId in body', () => {
    expect(
      profileUpdateSchema.safeParse({ taxId: '9999999999' }).success
    ).toBe(false);
  });

  it('rejects status in body', () => {
    expect(
      profileUpdateSchema.safeParse({ status: 'APPROVED' }).success
    ).toBe(false);
  });

  it('rejects ownerUserId in body', () => {
    expect(
      profileUpdateSchema.safeParse({ ownerUserId: 'abc' }).success
    ).toBe(false);
  });
});

describe('approveDecisionSchema', () => {
  it('accepts APPROVE without reason', () => {
    expect(approveDecisionSchema.safeParse({ decision: 'APPROVE' }).success).toBe(true);
  });

  it('accepts REJECT with reason', () => {
    expect(
      approveDecisionSchema.safeParse({ decision: 'REJECT', reason: 'Tax ID invalid' }).success
    ).toBe(true);
  });

  it('rejects REJECT without reason', () => {
    const result = approveDecisionSchema.safeParse({ decision: 'REJECT' });
    expect(result.success).toBe(false);
  });

  it('rejects REJECT with empty reason', () => {
    expect(
      approveDecisionSchema.safeParse({ decision: 'REJECT', reason: '' }).success
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run __tests__/lib/corporate/validators.test.ts`
Expected: FAIL with module-not-found for `lib/corporate/validators`.

- [ ] **Step 3: Implement**

```ts
// lib/corporate/validators.ts
import { z } from 'zod';
import { ELIGIBLE_CATEGORIES } from './types';

const categoryEnum = z.enum(ELIGIBLE_CATEGORIES as unknown as [string, ...string[]]);

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(200),
  legalName: z.string().trim().max(300).optional(),
  taxId: z.string().trim().min(1).max(50),
  contactEmail: z.string().email().toLowerCase(),
  contactPhone: z.string().trim().max(50).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  logoUrl: z.string().url().max(500).optional(),
  password: z.string().min(8).max(200),
}).strict();

export const matchingRuleSchema = z.object({
  ratio: z.number().int().refine((v) => v === 1 || v === 2 || v === 3, {
    message: 'ratio must be 1, 2, or 3',
  }),
  monthlyBudgetTRY: z.number().int().positive(),
  eligibleCategories: z.array(categoryEnum).min(1),
  active: z.boolean(),
}).strict();

export const simulateSchema = z.object({
  donationAmountTRY: z.number().int().positive(),
  category: categoryEnum,
}).strict();

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  legalName: z.string().trim().max(300).nullable().optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  contactEmail: z.string().email().toLowerCase().optional(),
  contactPhone: z.string().trim().max(50).nullable().optional(),
  websiteUrl: z.string().url().max(500).nullable().optional(),
}).strict();

export const approveDecisionSchema = z
  .object({
    decision: z.enum(['APPROVE', 'REJECT']),
    reason: z.string().trim().min(1).max(1000).optional(),
  })
  .strict()
  .refine(
    (v) => v.decision === 'APPROVE' || (v.decision === 'REJECT' && !!v.reason),
    { message: 'reason is required when decision is REJECT', path: ['reason'] }
  );

export type SignupInput = z.infer<typeof signupSchema>;
export type MatchingRuleInput = z.infer<typeof matchingRuleSchema>;
export type SimulateInputBody = z.infer<typeof simulateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ApproveDecisionInput = z.infer<typeof approveDecisionSchema>;
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run __tests__/lib/corporate/validators.test.ts`
Expected: All passed.

- [ ] **Step 5: Commit**

```bash
git add lib/corporate/validators.ts __tests__/lib/corporate/validators.test.ts
git commit -m "feat(corporate): add zod validators for signup/rule/simulate/profile/approve"
```

---

## Chunk 2: Engine + email templates

### Task 6: Pure matching engine (TDD)

**Files:**
- Create: `lib/corporate/matching-engine.ts`
- Create: `__tests__/lib/corporate/matching-engine.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// __tests__/lib/corporate/matching-engine.test.ts
import { describe, it, expect } from 'vitest';
import { simulate } from '../../../lib/corporate/matching-engine';
import type { MatchingRule } from '@prisma/client';

const baseRule: MatchingRule = {
  id: 'rule_1',
  companyId: 'co_1',
  ratio: 2,
  monthlyBudgetTRY: 10_000,
  eligibleCategories: ['tuition', 'books'],
  active: true,
  effectiveFrom: new Date('2026-01-01'),
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('simulate()', () => {
  it('matches a valid donation', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({
      matched: true,
      matchedAmountTRY: 200,
      ratioApplied: 2,
      remainingBudgetTRY: 9_800,
    });
  });

  it('rejects INVALID_INPUT for zero amount', () => {
    const r = simulate({
      donationAmountTRY: 0,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'INVALID_INPUT' });
  });

  it('rejects INVALID_INPUT for negative amount', () => {
    const r = simulate({
      donationAmountTRY: -50,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'INVALID_INPUT' });
  });

  it('rejects RULE_INACTIVE when active is false', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'tuition',
      rule: { ...baseRule, active: false },
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'RULE_INACTIVE' });
  });

  it('rejects CATEGORY_INELIGIBLE for unlisted category', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'travel',
      rule: baseRule,
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'CATEGORY_INELIGIBLE' });
  });

  it('rejects BUDGET_EXHAUSTED when remaining is zero', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 10_000,
    });
    expect(r).toEqual({ matched: false, reason: 'BUDGET_EXHAUSTED' });
  });

  it('rejects BUDGET_EXHAUSTED when match exceeds remaining', () => {
    // remaining = 100, wouldMatch = 200
    const r = simulate({
      donationAmountTRY: 100,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 9_900,
    });
    expect(r).toEqual({ matched: false, reason: 'BUDGET_EXHAUSTED' });
  });

  it('matches when match exactly equals remaining', () => {
    // remaining = 200, wouldMatch = 200
    const r = simulate({
      donationAmountTRY: 100,
      category: 'tuition',
      rule: baseRule,
      spentInPeriodTRY: 9_800,
    });
    expect(r).toEqual({
      matched: true,
      matchedAmountTRY: 200,
      ratioApplied: 2,
      remainingBudgetTRY: 0,
    });
  });

  it('precedence: INVALID_INPUT short-circuits before RULE_INACTIVE', () => {
    const r = simulate({
      donationAmountTRY: 0,
      category: 'tuition',
      rule: { ...baseRule, active: false },
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'INVALID_INPUT' });
  });

  it('precedence: RULE_INACTIVE short-circuits before CATEGORY_INELIGIBLE', () => {
    const r = simulate({
      donationAmountTRY: 100,
      category: 'travel',
      rule: { ...baseRule, active: false },
      spentInPeriodTRY: 0,
    });
    expect(r).toEqual({ matched: false, reason: 'RULE_INACTIVE' });
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run __tests__/lib/corporate/matching-engine.test.ts`
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement**

```ts
// lib/corporate/matching-engine.ts
import type { SimulateInput, SimulateResult } from './types';

export function simulate(input: SimulateInput): SimulateResult {
  const { donationAmountTRY, category, rule, spentInPeriodTRY } = input;

  if (!Number.isFinite(donationAmountTRY) || donationAmountTRY <= 0) {
    return { matched: false, reason: 'INVALID_INPUT' };
  }

  if (!rule.active) {
    return { matched: false, reason: 'RULE_INACTIVE' };
  }

  if (!rule.eligibleCategories.includes(category)) {
    return { matched: false, reason: 'CATEGORY_INELIGIBLE' };
  }

  const wouldMatch = donationAmountTRY * rule.ratio;
  const remaining = rule.monthlyBudgetTRY - spentInPeriodTRY;

  if (remaining <= 0 || wouldMatch > remaining) {
    return { matched: false, reason: 'BUDGET_EXHAUSTED' };
  }

  return {
    matched: true,
    matchedAmountTRY: wouldMatch,
    ratioApplied: rule.ratio,
    remainingBudgetTRY: remaining - wouldMatch,
  };
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run __tests__/lib/corporate/matching-engine.test.ts`
Expected: All 10 tests passed.

- [ ] **Step 5: Commit**

```bash
git add lib/corporate/matching-engine.ts __tests__/lib/corporate/matching-engine.test.ts
git commit -m "feat(corporate): add pure matching engine with full branch coverage"
```

---

### Task 7: Email templates + render tests

**Files:**
- Create: `lib/corporate/email-templates.tsx` (JSX file — `.tsx` extension)
- Create: `__tests__/lib/corporate/email-templates.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// __tests__/lib/corporate/email-templates.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@react-email/render';
import {
  BudgetThreshold80Email,
  BudgetThresholdReachedEmail,
} from '../../../lib/corporate/email-templates';

describe('BudgetThreshold80Email', () => {
  it('renders company name, period, and remaining amount', async () => {
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
    expect(html).toContain('80%');
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
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run __tests__/lib/corporate/email-templates.test.tsx`
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement**

```tsx
// lib/corporate/email-templates.tsx
import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Section,
} from '@react-email/components';

type Props80 = {
  companyName: string;
  periodKey: string;
  spentTRY: number;
  limitTRY: number;
};

export function BudgetThreshold80Email(props: Props80) {
  const { companyName, periodKey, spentTRY, limitTRY } = props;
  return (
    <Html>
      <Body>
        <Container>
          <Heading>Bütçenizin %80'i kullanıldı</Heading>
          <Section>
            <Text>Sayın {companyName} yetkilisi,</Text>
            <Text>
              {periodKey} dönemi için belirlediğiniz {limitTRY.toLocaleString('tr-TR')} TL aylık eşleştirme bütçesinin
              %80'i ({spentTRY.toLocaleString('tr-TR')} TL) kullanılmıştır.
            </Text>
            <Text>
              Yeni eşleştirmeler bütçe tükenene kadar normal şekilde işlenecektir. Limit dolduğunda
              ek eşleştirme yapılmayacaktır.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

type PropsReached = {
  companyName: string;
  periodKey: string;
  limitTRY: number;
};

export function BudgetThresholdReachedEmail(props: PropsReached) {
  const { companyName, periodKey, limitTRY } = props;
  return (
    <Html>
      <Body>
        <Container>
          <Heading>Aylık eşleştirme bütçeniz tükendi</Heading>
          <Section>
            <Text>Sayın {companyName} yetkilisi,</Text>
            <Text>
              {periodKey} dönemi için {limitTRY.toLocaleString('tr-TR')} TL aylık bütçeniz tamamen kullanılmıştır.
              Bu ay yapılacak yeni bağışlar eşleştirme programınıza dahil edilmeyecektir.
            </Text>
            <Text>Bütçe bir sonraki ayın başında otomatik olarak yenilenecektir.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run __tests__/lib/corporate/email-templates.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/corporate/email-templates.tsx __tests__/lib/corporate/email-templates.test.tsx
git commit -m "feat(corporate): add budget threshold email templates (Phase 1: render only)"
```

---

## Chunk 3: Auth + Repos

### Task 8: Extend NextAuth session types

**Files:**
- Modify: `types/next-auth.d.ts` (or create if missing)

- [ ] **Step 1: Check if file exists**

Run: `ls types/next-auth.d.ts 2>&1 || echo MISSING`. If MISSING, create it; otherwise modify.

- [ ] **Step 2: Add module augmentation**

Append to `types/next-auth.d.ts` (create with this content if missing):

```ts
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role?: 'user' | 'admin' | 'company_owner';
      accountType?: string;
      companyId?: string | null;
      companyStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'user' | 'admin' | 'company_owner';
    accountType?: string;
    companyId?: string | null;
    companyStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | null;
  }
}
```

If a `next-auth.d.ts` already exists with a `Session` interface, **merge** the new fields rather than replacing. The agent should `Read` the file first.

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add types/next-auth.d.ts
git commit -m "feat(corporate): extend NextAuth session/JWT types with company fields"
```

---

### Task 9: Update NextAuth JWT/session callbacks

**Files:**
- Modify: `auth.ts:158-210` (JWT and session callbacks)
- Modify: `auth.ts` (top of file — add Prisma import)

- [ ] **Step 1: Add Prisma import**

At the top of `auth.ts`, add:

```ts
import { prisma } from '@/lib/prisma';
```

(Verify `lib/prisma.ts` exists by running `cat lib/prisma.ts | head -5` — it does, per the existing repo. If not, that's a separate bug to flag.)

- [ ] **Step 2: Modify JWT callback to stamp companyId/companyStatus**

In `auth.ts`, locate the `async jwt({ token, user, account, trigger })` callback. After the existing block that sets `token.role` and `token.accountType` from the DB (after the `if (user)` block at line ~158-179), append a block that resolves company info **only when role is company_owner**:

```ts
async jwt({ token, user, account, trigger }) {
  if (user) {
    token.id = user.id;
    token.name = user.name;
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    token.role = adminEmails.includes(user.email?.toLowerCase() || '') ? 'admin' : 'user';

    // Load accountType + role override from DB (company_owner overrides 'user')
    try {
      const db = await getDb();
      const dbUser = await db.collection('users').findOne(
        { _id: new ObjectId(user.id as string) },
        { projection: { accountType: 1, role: 1 } }
      );
      token.accountType = dbUser?.accountType || 'student';
      // If DB has role 'company_owner', honor it (admin still wins)
      if (token.role !== 'admin' && dbUser?.role === 'company_owner') {
        token.role = 'company_owner';
      }
    } catch {
      token.accountType = 'student';
    }

    // For company_owner, stamp company info into JWT
    if (token.role === 'company_owner') {
      try {
        const company = await prisma.company.findUnique({
          where: { ownerUserId: user.id as string },
          select: { id: true, status: true },
        });
        token.companyId = company?.id ?? null;
        token.companyStatus = company?.status ?? null;
      } catch {
        token.companyId = null;
        token.companyStatus = null;
      }
    }
  }

  // PRESERVE: existing `if (trigger === 'update' && token.id)` block from auth.ts:182-195.
  // Do NOT delete or modify it. Keep the existing name-refresh logic exactly as written.

  return token;
},
```

**Note:** The existing logic that derives `token.role` from `ADMIN_EMAILS` is preserved. The new code only **promotes** the role to `company_owner` when (a) the user is not admin and (b) the DB has `role: 'company_owner'`. This is set at signup time (Task 13).

- [ ] **Step 3: Update session callback**

In the same file, modify the session callback to expose `companyId` and `companyStatus`:

```ts
async session({ session, token }) {
  if (session.user && token) {
    (session.user as any).id = token.id;
    (session.user as any).role = token.role || 'user';
    (session.user as any).accountType = token.accountType || 'student';
    (session.user as any).companyId = token.companyId ?? null;
    (session.user as any).companyStatus = token.companyStatus ?? null;
    if (token.name) {
      session.user.name = token.name as string;
    }
  }
  return session;
},
```

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No new errors. (Type augmentation from Task 8 should make `token.companyId` etc. type-check.)

- [ ] **Step 5: Commit**

```bash
git add auth.ts
git commit -m "feat(corporate): stamp companyId/companyStatus into NextAuth JWT"
```

---

### Task 10: New authz helpers (TDD)

**Files:**
- Modify: `lib/authz.ts` (append helpers)
- Create: `__tests__/lib/corporate/authz.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// __tests__/lib/corporate/authz.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  requireCompanyOwner,
  requireApprovedCompanyOwner,
} from '../../../lib/authz';
import { auth } from '../../../auth';
import { prisma } from '../../../lib/prisma';

vi.mock('../../../auth', () => ({ auth: vi.fn() }));
vi.mock('../../../lib/prisma', () => ({
  prisma: {
    company: { findUnique: vi.fn() },
  },
}));

const sessionUser = {
  id: '507f1f77bcf86cd799439011',
  email: 'owner@acme.com',
  name: 'Owner',
  role: 'company_owner',
};

describe('requireCompanyOwner', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws Unauthorized when no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    await expect(requireCompanyOwner()).rejects.toThrow('Unauthorized');
  });

  it('throws Forbidden when role is not company_owner', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { ...sessionUser, role: 'user' } } as any);
    await expect(requireCompanyOwner()).rejects.toThrow('Forbidden');
  });

  it('throws Forbidden when no Company record exists', async () => {
    vi.mocked(auth).mockResolvedValue({ user: sessionUser } as any);
    vi.mocked(prisma.company.findUnique).mockResolvedValue(null);
    await expect(requireCompanyOwner()).rejects.toThrow('Forbidden');
  });

  it('returns user + company on success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: sessionUser } as any);
    vi.mocked(prisma.company.findUnique).mockResolvedValue({
      id: 'co_1', status: 'PENDING', ownerUserId: sessionUser.id,
    } as any);
    const ctx = await requireCompanyOwner();
    expect(ctx.user.id).toBe(sessionUser.id);
    expect(ctx.company.id).toBe('co_1');
  });
});

describe('requireApprovedCompanyOwner', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws CompanyNotApproved when status is PENDING', async () => {
    vi.mocked(auth).mockResolvedValue({ user: sessionUser } as any);
    vi.mocked(prisma.company.findUnique).mockResolvedValue({
      id: 'co_1', status: 'PENDING', ownerUserId: sessionUser.id,
    } as any);
    await expect(requireApprovedCompanyOwner()).rejects.toThrow('CompanyNotApproved');
  });

  it('returns context when status is APPROVED', async () => {
    vi.mocked(auth).mockResolvedValue({ user: sessionUser } as any);
    vi.mocked(prisma.company.findUnique).mockResolvedValue({
      id: 'co_1', status: 'APPROVED', ownerUserId: sessionUser.id,
    } as any);
    const ctx = await requireApprovedCompanyOwner();
    expect(ctx.company.status).toBe('APPROVED');
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run __tests__/lib/corporate/authz.test.ts`
Expected: FAIL — `requireCompanyOwner` not exported.

- [ ] **Step 3: Add helpers to `lib/authz.ts`**

`requireAdmin` already exists in `lib/authz.ts:62` — **do not redefine it**. Only add the two new company helpers below.

Append to `lib/authz.ts`:

```ts
import { prisma } from '@/lib/prisma';
import type { Company } from '@prisma/client';

export interface CompanyOwnerContext {
  user: SessionUser;
  company: Company;
}

export async function requireCompanyOwner(): Promise<CompanyOwnerContext> {
  const user = await requireUser();
  if (user.role !== 'company_owner') {
    const err: any = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
  const company = await prisma.company.findUnique({
    where: { ownerUserId: user.id },
  });
  if (!company) {
    const err: any = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
  return { user, company };
}

export async function requireApprovedCompanyOwner(): Promise<CompanyOwnerContext> {
  const ctx = await requireCompanyOwner();
  if (ctx.company.status !== 'APPROVED') {
    const err: any = new Error('CompanyNotApproved');
    err.statusCode = 403;
    throw err;
  }
  return ctx;
}
```

**Note:** The existing `requireRole(['admin'])` allows `'user' | 'admin'` only. Since the existing `requireUser` typing has `role: 'user' | 'admin'`, the comparison `user.role !== 'company_owner'` will trigger a TS narrowing issue. Update the `SessionUser` interface in `lib/authz.ts:9` to `role: 'user' | 'admin' | 'company_owner'`.

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run __tests__/lib/corporate/authz.test.ts`
Expected: All passed.

- [ ] **Step 5: Run the existing authz test suite to confirm no regression**

Run: `npx vitest run __tests__/authz.test.ts`
Expected: All pre-existing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add lib/authz.ts __tests__/lib/corporate/authz.test.ts
git commit -m "feat(corporate): add requireCompanyOwner + requireApprovedCompanyOwner authz helpers"
```

---

### Task 11: Company repository

**Files:**
- Create: `lib/corporate/company-repo.ts`

This file is a thin wrapper to centralize Prisma calls. No tests in this task — it's exercised by API route tests.

- [ ] **Step 1: Write the file**

```ts
// lib/corporate/company-repo.ts
import { prisma } from '@/lib/prisma';
import type { Company, CompanyStatus, Prisma } from '@prisma/client';

export type CreateCompanyInput = {
  name: string;
  legalName?: string;
  taxId: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  logoUrl?: string;
  ownerUserId: string;
};

export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  return prisma.company.create({
    data: {
      ...input,
      status: 'PENDING',
    },
  });
}

export async function findCompanyByOwner(ownerUserId: string): Promise<Company | null> {
  return prisma.company.findUnique({ where: { ownerUserId } });
}

export async function findCompanyById(id: string): Promise<Company | null> {
  return prisma.company.findUnique({ where: { id } });
}

export async function findCompaniesByStatus(status: CompanyStatus): Promise<Company[]> {
  return prisma.company.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteCompany(id: string): Promise<void> {
  await prisma.company.delete({ where: { id } });
}

export type UpdateCompanyProfileInput = Partial<
  Pick<Company, 'name' | 'legalName' | 'logoUrl' | 'contactEmail' | 'contactPhone' | 'websiteUrl'>
>;

export async function updateCompanyProfile(
  id: string,
  input: UpdateCompanyProfileInput
): Promise<Company> {
  return prisma.company.update({
    where: { id },
    data: input as Prisma.CompanyUpdateInput,
  });
}

export async function approveCompany(id: string, adminUserId: string): Promise<Company> {
  return prisma.company.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: adminUserId,
      rejectedReason: null,
    },
  });
}

export async function rejectCompany(id: string, reason: string): Promise<Company> {
  return prisma.company.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectedReason: reason,
    },
  });
}

export async function isTaxIdTaken(taxId: string): Promise<boolean> {
  const existing = await prisma.company.findUnique({ where: { taxId } });
  return !!existing;
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/corporate/company-repo.ts
git commit -m "feat(corporate): add company-repo Prisma wrapper"
```

---

### Task 12: Matching rule repository

**Files:**
- Create: `lib/corporate/matching-rule-repo.ts`

- [ ] **Step 1: Write the file**

```ts
// lib/corporate/matching-rule-repo.ts
import { prisma } from '@/lib/prisma';
import type { MatchingRule } from '@prisma/client';
import type { MatchingRuleInput } from './validators';

export async function findRuleByCompany(companyId: string): Promise<MatchingRule | null> {
  return prisma.matchingRule.findUnique({ where: { companyId } });
}

export async function upsertRule(
  companyId: string,
  input: MatchingRuleInput
): Promise<MatchingRule> {
  return prisma.matchingRule.upsert({
    where: { companyId },
    create: {
      companyId,
      ratio: input.ratio,
      monthlyBudgetTRY: input.monthlyBudgetTRY,
      eligibleCategories: input.eligibleCategories,
      active: input.active,
    },
    update: {
      ratio: input.ratio,
      monthlyBudgetTRY: input.monthlyBudgetTRY,
      eligibleCategories: input.eligibleCategories,
      active: input.active,
    },
  });
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/corporate/matching-rule-repo.ts
git commit -m "feat(corporate): add matching-rule-repo with upsert"
```

---

## Chunk 4: API routes

### Task 13: POST /api/corporate/signup (TDD)

**Files:**
- Create: `app/api/corporate/signup/route.ts`
- Create: `__tests__/api/corporate/signup.test.ts`

**Reference for the request/response envelope:** `app/api/corporate/dashboard/route.ts:14-44`.

**User creation:** Reuse the existing pattern. The signup directly inserts into the `users` MongoDB collection with `role: 'company_owner'`, `accountType: 'company'`, and a bcrypt password hash. There is no helper for "create a user with a password" — the existing `findOrCreateUserByPhone` is OTP-based and not reusable.

- [ ] **Step 1: Write the failing tests**

```ts
// __tests__/api/corporate/signup.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as signup } from '../../../app/api/corporate/signup/route';

const insertOne = vi.fn();
const findOne = vi.fn();
const deleteOne = vi.fn();

vi.mock('../../../lib/db', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: vi.fn(() => ({ insertOne, findOne, deleteOne })),
  }),
}));

const createCompany = vi.fn();
const isTaxIdTaken = vi.fn();
vi.mock('../../../lib/corporate/company-repo', () => ({
  createCompany: (...args: any[]) => createCompany(...args),
  isTaxIdTaken: (...args: any[]) => isTaxIdTaken(...args),
}));

vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

function makeRequest(body: any) {
  return new NextRequest('http://localhost/api/corporate/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: 'Acme Corp',
  taxId: '1234567890',
  contactEmail: 'owner@acme.com',
  password: 'StrongPass1!',
};

describe('POST /api/corporate/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertOne.mockReset();
    findOne.mockReset();
    deleteOne.mockReset();
    createCompany.mockReset();
    isTaxIdTaken.mockReset();
  });

  it('creates User and Company on valid input', async () => {
    findOne.mockResolvedValue(null); // email not taken
    isTaxIdTaken.mockResolvedValue(false);
    insertOne.mockResolvedValue({ insertedId: { toString: () => 'user_1' } });
    createCompany.mockResolvedValue({ id: 'co_1', status: 'PENDING' });

    const res = await signup(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.companyId).toBe('co_1');
    expect(json.data.status).toBe('PENDING');
    expect(insertOne).toHaveBeenCalledTimes(1);
    expect(createCompany).toHaveBeenCalledTimes(1);
  });

  it('returns 400 on invalid body', async () => {
    const res = await signup(makeRequest({ name: 'A', password: 'x' }));
    expect(res.status).toBe(400);
  });

  it('returns 409 when email is already taken', async () => {
    findOne.mockResolvedValue({ _id: 'existing', email: validBody.contactEmail });
    const res = await signup(makeRequest(validBody));
    expect(res.status).toBe(409);
  });

  it('returns 409 when taxId is already taken', async () => {
    findOne.mockResolvedValue(null);
    isTaxIdTaken.mockResolvedValue(true);
    const res = await signup(makeRequest(validBody));
    expect(res.status).toBe(409);
  });

  it('compensates by deleting User if Company creation fails', async () => {
    findOne.mockResolvedValue(null);
    isTaxIdTaken.mockResolvedValue(false);
    // Use a real ObjectId-shaped string so `new ObjectId(newUserId)` in the route does not throw
    const fakeId = '507f1f77bcf86cd799439099';
    insertOne.mockResolvedValue({ insertedId: { toString: () => fakeId } });
    createCompany.mockRejectedValue(new Error('DB exploded'));

    const res = await signup(makeRequest(validBody));
    expect(res.status).toBe(500);
    expect(deleteOne).toHaveBeenCalledTimes(1);
    // Critical: assert the rollback targets the *correct* user, not just "any" user
    const deleteArg = deleteOne.mock.calls[0][0];
    expect(deleteArg._id.toString()).toBe(fakeId);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run __tests__/api/corporate/signup.test.ts`
Expected: FAIL — route module not found.

- [ ] **Step 3: Implement the route**

```ts
// app/api/corporate/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { signupSchema } from '@/lib/corporate/validators';
import { createCompany, isTaxIdTaken } from '@/lib/corporate/company-repo';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const db = await getDb();
  const users = db.collection('users');

  const emailExists = await users.findOne({ email: input.contactEmail });
  if (emailExists) {
    return NextResponse.json({ success: false, error: 'EMAIL_TAKEN' }, { status: 409 });
  }

  if (await isTaxIdTaken(input.taxId)) {
    return NextResponse.json({ success: false, error: 'TAX_ID_TAKEN' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const userInsert = await users.insertOne({
    email: input.contactEmail,
    name: input.name,
    password: passwordHash,
    role: 'company_owner',
    accountType: 'company',
    provider: 'credentials',
    emailVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const newUserId = userInsert.insertedId.toString();

  let company;
  try {
    company = await createCompany({
      name: input.name,
      legalName: input.legalName,
      taxId: input.taxId,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      websiteUrl: input.websiteUrl,
      logoUrl: input.logoUrl,
      ownerUserId: newUserId,
    });
  } catch (err) {
    // Compensation: delete the orphan User
    try {
      await users.deleteOne({ _id: new ObjectId(newUserId) });
    } catch (rollbackErr) {
      logger?.error?.({
        tag: 'signup.orphan_user',
        userId: newUserId,
        original: String(err),
        rollback: String(rollbackErr),
      });
    }
    return NextResponse.json(
      { success: false, error: 'SIGNUP_FAILED' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { companyId: company.id, status: company.status },
    meta: { timestamp: new Date().toISOString(), version: '1.0' },
  });
}
```

**Note on `logger`:** The repo has `lib/logger.ts`; the route imports it defensively (`logger?.error?.(...)`) so a missing method does not break compensation flow. The agent should `Read` `lib/logger.ts` first and adapt the call to the actual logger API (e.g. `logger.error('msg', meta)`). This is not optional — the orphan path must log.

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run __tests__/api/corporate/signup.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add app/api/corporate/signup/route.ts __tests__/api/corporate/signup.test.ts
git commit -m "feat(corporate): POST /api/corporate/signup with compensation rollback"
```

---

### Task 14: GET/PATCH /api/corporate/me (TDD)

**Files:**
- Create: `app/api/corporate/me/route.ts`
- Create: `__tests__/api/corporate/me.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// __tests__/api/corporate/me.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH } from '../../../app/api/corporate/me/route';

vi.mock('../../../lib/authz', () => ({
  requireCompanyOwner: vi.fn(),
  requireApprovedCompanyOwner: vi.fn(),
}));
vi.mock('../../../lib/corporate/matching-rule-repo', () => ({
  findRuleByCompany: vi.fn(),
}));
vi.mock('../../../lib/corporate/company-repo', () => ({
  updateCompanyProfile: vi.fn(),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { requireCompanyOwner, requireApprovedCompanyOwner } from '../../../lib/authz';
import { findRuleByCompany } from '../../../lib/corporate/matching-rule-repo';
import { updateCompanyProfile } from '../../../lib/corporate/company-repo';

const company = { id: 'co_1', status: 'APPROVED', name: 'Acme', taxId: '123' } as any;

describe('GET /api/corporate/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    vi.mocked(requireCompanyOwner).mockRejectedValue(new Error('Unauthorized'));
    const res = await GET(new NextRequest('http://localhost/api/corporate/me'));
    expect(res.status).toBe(401);
  });

  it('returns company + matchingRule', async () => {
    vi.mocked(requireCompanyOwner).mockResolvedValue({ user: { id: 'u' } as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue({ id: 'r_1', companyId: 'co_1' } as any);
    const res = await GET(new NextRequest('http://localhost/api/corporate/me'));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.company.id).toBe('co_1');
    expect(json.data.matchingRule.id).toBe('r_1');
  });

  it('returns null matchingRule when no rule exists', async () => {
    vi.mocked(requireCompanyOwner).mockResolvedValue({ user: { id: 'u' } as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(null);
    const res = await GET(new NextRequest('http://localhost/api/corporate/me'));
    const json = await res.json();
    expect(json.data.matchingRule).toBeNull();
  });
});

describe('PATCH /api/corporate/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when company not approved', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockRejectedValue(
      Object.assign(new Error('CompanyNotApproved'), { statusCode: 403 })
    );
    const req = new NextRequest('http://localhost/api/corporate/me', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(403);
  });

  it('rejects taxId in body', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: { id: 'u' } as any, company });
    const req = new NextRequest('http://localhost/api/corporate/me', {
      method: 'PATCH',
      body: JSON.stringify({ taxId: '999' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('updates allowed fields', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: { id: 'u' } as any, company });
    vi.mocked(updateCompanyProfile).mockResolvedValue({ ...company, name: 'New Name' } as any);
    const req = new NextRequest('http://localhost/api/corporate/me', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const res = await PATCH(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.name).toBe('New Name');
    expect(updateCompanyProfile).toHaveBeenCalledWith('co_1', { name: 'New Name' });
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run __tests__/api/corporate/me.test.ts`
Expected: FAIL — route module not found.

- [ ] **Step 3: Implement**

```ts
// app/api/corporate/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireCompanyOwner, requireApprovedCompanyOwner } from '@/lib/authz';
import { findRuleByCompany } from '@/lib/corporate/matching-rule-repo';
import { updateCompanyProfile } from '@/lib/corporate/company-repo';
import { profileUpdateSchema } from '@/lib/corporate/validators';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireCompanyOwner();
    const matchingRule = await findRuleByCompany(company.id);
    return NextResponse.json({
      success: true,
      data: { company, matchingRule },
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}

export async function PATCH(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireApprovedCompanyOwner();
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const updated = await updateCompanyProfile(company.id, parsed.data as any);
    return NextResponse.json({
      success: true,
      data: updated,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run __tests__/api/corporate/me.test.ts`
Expected: All passed.

- [ ] **Step 5: Commit**

```bash
git add app/api/corporate/me/route.ts __tests__/api/corporate/me.test.ts
git commit -m "feat(corporate): GET/PATCH /api/corporate/me"
```

---

### Task 15: GET/PUT /api/corporate/matching-rule (TDD)

**Files:**
- Create: `app/api/corporate/matching-rule/route.ts`
- Create: `__tests__/api/corporate/matching-rule.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// __tests__/api/corporate/matching-rule.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT } from '../../../app/api/corporate/matching-rule/route';

vi.mock('../../../lib/authz', () => ({
  requireApprovedCompanyOwner: vi.fn(),
}));
vi.mock('../../../lib/corporate/matching-rule-repo', () => ({
  findRuleByCompany: vi.fn(),
  upsertRule: vi.fn(),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { requireApprovedCompanyOwner } from '../../../lib/authz';
import { findRuleByCompany, upsertRule } from '../../../lib/corporate/matching-rule-repo';

const company = { id: 'co_1', status: 'APPROVED' } as any;

describe('GET /api/corporate/matching-rule', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when no rule exists', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(null);
    const res = await GET(new NextRequest('http://localhost/api/corporate/matching-rule'));
    const json = await res.json();
    expect(json.data).toBeNull();
  });

  it('returns rule when present', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue({ id: 'r_1', ratio: 2 } as any);
    const res = await GET(new NextRequest('http://localhost/api/corporate/matching-rule'));
    const json = await res.json();
    expect(json.data.id).toBe('r_1');
  });
});

describe('PUT /api/corporate/matching-rule', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects invalid ratio', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    const req = new NextRequest('http://localhost/api/corporate/matching-rule', {
      method: 'PUT',
      body: JSON.stringify({
        ratio: 5,
        monthlyBudgetTRY: 1000,
        eligibleCategories: ['tuition'],
        active: true,
      }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it('upserts rule on valid input', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(upsertRule).mockResolvedValue({ id: 'r_1', ratio: 2 } as any);
    const req = new NextRequest('http://localhost/api/corporate/matching-rule', {
      method: 'PUT',
      body: JSON.stringify({
        ratio: 2,
        monthlyBudgetTRY: 50_000,
        eligibleCategories: ['tuition', 'books'],
        active: true,
      }),
    });
    const res = await PUT(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.id).toBe('r_1');
    expect(upsertRule).toHaveBeenCalledWith('co_1', expect.objectContaining({ ratio: 2 }));
  });

  it('returns 403 when company not approved', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockRejectedValue(
      Object.assign(new Error('CompanyNotApproved'), { statusCode: 403 })
    );
    const req = new NextRequest('http://localhost/api/corporate/matching-rule', {
      method: 'PUT',
      body: JSON.stringify({
        ratio: 2,
        monthlyBudgetTRY: 50_000,
        eligibleCategories: ['tuition'],
        active: true,
      }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(403);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run __tests__/api/corporate/matching-rule.test.ts`
Expected: FAIL — route module not found.

- [ ] **Step 3: Implement**

```ts
// app/api/corporate/matching-rule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedCompanyOwner } from '@/lib/authz';
import {
  findRuleByCompany,
  upsertRule,
} from '@/lib/corporate/matching-rule-repo';
import { matchingRuleSchema } from '@/lib/corporate/validators';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireApprovedCompanyOwner();
    const rule = await findRuleByCompany(company.id);
    return NextResponse.json({
      success: true,
      data: rule,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}

export async function PUT(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireApprovedCompanyOwner();
    const body = await request.json();
    const parsed = matchingRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const updated = await upsertRule(company.id, parsed.data);
    return NextResponse.json({
      success: true,
      data: updated,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run __tests__/api/corporate/matching-rule.test.ts`
Expected: All passed.

- [ ] **Step 5: Commit**

```bash
git add app/api/corporate/matching-rule/route.ts __tests__/api/corporate/matching-rule.test.ts
git commit -m "feat(corporate): GET/PUT /api/corporate/matching-rule with upsert"
```

---

### Task 16: POST /api/corporate/matching/simulate (TDD)

**Files:**
- Create: `app/api/corporate/matching/simulate/route.ts`
- Create: `__tests__/api/corporate/simulate.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// __tests__/api/corporate/simulate.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../../app/api/corporate/matching/simulate/route';

vi.mock('../../../lib/authz', () => ({
  requireApprovedCompanyOwner: vi.fn(),
}));
vi.mock('../../../lib/corporate/matching-rule-repo', () => ({
  findRuleByCompany: vi.fn(),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { requireApprovedCompanyOwner } from '../../../lib/authz';
import { findRuleByCompany } from '../../../lib/corporate/matching-rule-repo';

const company = { id: 'co_1', status: 'APPROVED' } as any;
const baseRule = {
  id: 'r_1',
  companyId: 'co_1',
  ratio: 2,
  monthlyBudgetTRY: 10_000,
  eligibleCategories: ['tuition'],
  active: true,
} as any;

function makeReq(body: any) {
  return new NextRequest('http://localhost/api/corporate/matching/simulate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/corporate/matching/simulate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns NO_RULE_DEFINED when company has no rule', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(null);
    const res = await POST(makeReq({ donationAmountTRY: 100, category: 'tuition' }));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('NO_RULE_DEFINED');
  });

  it('returns matched result for valid donation', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(baseRule);
    const res = await POST(makeReq({ donationAmountTRY: 100, category: 'tuition' }));
    const json = await res.json();
    expect(json.data.matched).toBe(true);
    expect(json.data.matchedAmountTRY).toBe(200);
  });

  it('returns RULE_INACTIVE when rule.active is false', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue({ ...baseRule, active: false });
    const res = await POST(makeReq({ donationAmountTRY: 100, category: 'tuition' }));
    const json = await res.json();
    expect(json.data.matched).toBe(false);
    expect(json.data.reason).toBe('RULE_INACTIVE');
  });

  it('returns CATEGORY_INELIGIBLE for unlisted category', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    vi.mocked(findRuleByCompany).mockResolvedValue(baseRule);
    const res = await POST(makeReq({ donationAmountTRY: 100, category: 'travel' }));
    const json = await res.json();
    expect(json.data.matched).toBe(false);
    expect(json.data.reason).toBe('CATEGORY_INELIGIBLE');
  });

  it('returns 400 on invalid body', async () => {
    vi.mocked(requireApprovedCompanyOwner).mockResolvedValue({ user: {} as any, company });
    const res = await POST(makeReq({ donationAmountTRY: -5, category: 'tuition' }));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run __tests__/api/corporate/simulate.test.ts`
Expected: FAIL — route module not found.

- [ ] **Step 3: Implement**

```ts
// app/api/corporate/matching/simulate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedCompanyOwner } from '@/lib/authz';
import { findRuleByCompany } from '@/lib/corporate/matching-rule-repo';
import { simulateSchema } from '@/lib/corporate/validators';
import { simulate } from '@/lib/corporate/matching-engine';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireApprovedCompanyOwner();
    const body = await request.json();
    const parsed = simulateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const rule = await findRuleByCompany(company.id);
    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'NO_RULE_DEFINED' },
        { status: 404 }
      );
    }

    // Phase 1: spentInPeriodTRY is always 0 (no MatchingTransaction records yet).
    // Phase 2 will replace this with prisma.matchingTransaction.aggregate(...) by periodKey + status APPROVED.
    const result = simulate({
      donationAmountTRY: parsed.data.donationAmountTRY,
      category: parsed.data.category,
      rule,
      spentInPeriodTRY: 0,
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run __tests__/api/corporate/simulate.test.ts`
Expected: All 5 passed.

- [ ] **Step 5: Commit**

```bash
git add app/api/corporate/matching/simulate/route.ts __tests__/api/corporate/simulate.test.ts
git commit -m "feat(corporate): POST /api/corporate/matching/simulate"
```

---

### Task 17: GET /api/admin/corporate/companies (TDD)

**Files:**
- Create: `app/api/admin/corporate/companies/route.ts`
- Create: `__tests__/api/admin/corporate-companies.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// __tests__/api/admin/corporate-companies.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../../../app/api/admin/corporate/companies/route';

vi.mock('../../../lib/authz', () => ({ requireAdmin: vi.fn() }));
vi.mock('../../../lib/corporate/company-repo', () => ({
  findCompaniesByStatus: vi.fn(),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { requireAdmin } from '../../../lib/authz';
import { findCompaniesByStatus } from '../../../lib/corporate/company-repo';

describe('GET /api/admin/corporate/companies', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for non-admin', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(
      Object.assign(new Error('Forbidden'), { statusCode: 403 })
    );
    const res = await GET(new NextRequest('http://localhost/api/admin/corporate/companies?status=PENDING'));
    expect(res.status).toBe(403);
  });

  it('returns PENDING list for admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompaniesByStatus).mockResolvedValue([
      { id: 'co_1', status: 'PENDING' } as any,
      { id: 'co_2', status: 'PENDING' } as any,
    ]);
    const res = await GET(
      new NextRequest('http://localhost/api/admin/corporate/companies?status=PENDING')
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(findCompaniesByStatus).toHaveBeenCalledWith('PENDING');
  });

  it('defaults to PENDING when status missing', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompaniesByStatus).mockResolvedValue([]);
    await GET(new NextRequest('http://localhost/api/admin/corporate/companies'));
    expect(findCompaniesByStatus).toHaveBeenCalledWith('PENDING');
  });

  it('rejects invalid status param', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    const res = await GET(
      new NextRequest('http://localhost/api/admin/corporate/companies?status=BOGUS')
    );
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run __tests__/api/admin/corporate-companies.test.ts`
Expected: FAIL — route module not found.

- [ ] **Step 3: Implement**

```ts
// app/api/admin/corporate/companies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authz';
import { findCompaniesByStatus } from '@/lib/corporate/company-repo';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import type { CompanyStatus } from '@prisma/client';

export const runtime = 'nodejs';

const VALID_STATUSES: CompanyStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const statusParam = (url.searchParams.get('status') || 'PENDING') as CompanyStatus;
    if (!VALID_STATUSES.includes(statusParam)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }
    const companies = await findCompaniesByStatus(statusParam);
    return NextResponse.json({
      success: true,
      data: companies,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run __tests__/api/admin/corporate-companies.test.ts`
Expected: All passed.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/corporate/companies/route.ts __tests__/api/admin/corporate-companies.test.ts
git commit -m "feat(corporate): GET /api/admin/corporate/companies (admin queue)"
```

---

### Task 18: POST /api/admin/corporate/companies/[id]/approve (TDD)

**Files:**
- Create: `app/api/admin/corporate/companies/[id]/approve/route.ts`
- Create: `__tests__/api/admin/corporate-approve.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// __tests__/api/admin/corporate-approve.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../../app/api/admin/corporate/companies/[id]/approve/route';

vi.mock('../../../lib/authz', () => ({ requireAdmin: vi.fn() }));
vi.mock('../../../lib/corporate/company-repo', () => ({
  findCompanyById: vi.fn(),
  approveCompany: vi.fn(),
  rejectCompany: vi.fn(),
}));
vi.mock('../../../lib/rate-limit', () => ({
  withRateLimit: vi.fn(() => null),
  RATE_LIMITS: { api: {} },
}));

import { requireAdmin } from '../../../lib/authz';
import {
  findCompanyById,
  approveCompany,
  rejectCompany,
} from '../../../lib/corporate/company-repo';

function makeReq(body: any) {
  return new NextRequest('http://localhost/api/admin/corporate/companies/co_1/approve', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/corporate/companies/[id]/approve', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for non-admin', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(
      Object.assign(new Error('Forbidden'), { statusCode: 403 })
    );
    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 'co_1' } });
    expect(res.status).toBe(403);
  });

  it('returns 404 when company not found', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompanyById).mockResolvedValue(null);
    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 'co_1' } });
    expect(res.status).toBe(404);
  });

  it('approves on APPROVE', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompanyById).mockResolvedValue({ id: 'co_1', status: 'PENDING' } as any);
    vi.mocked(approveCompany).mockResolvedValue({ id: 'co_1', status: 'APPROVED' } as any);
    const res = await POST(makeReq({ decision: 'APPROVE' }), { params: { id: 'co_1' } });
    const json = await res.json();
    expect(json.data.status).toBe('APPROVED');
    expect(approveCompany).toHaveBeenCalledWith('co_1', 'admin_1');
  });

  it('rejects when REJECT lacks reason', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompanyById).mockResolvedValue({ id: 'co_1', status: 'PENDING' } as any);
    const res = await POST(makeReq({ decision: 'REJECT' }), { params: { id: 'co_1' } });
    expect(res.status).toBe(400);
  });

  it('rejects on REJECT with reason', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: 'admin_1' } as any);
    vi.mocked(findCompanyById).mockResolvedValue({ id: 'co_1', status: 'PENDING' } as any);
    vi.mocked(rejectCompany).mockResolvedValue({
      id: 'co_1',
      status: 'REJECTED',
      rejectedReason: 'Tax ID invalid',
    } as any);
    const res = await POST(
      makeReq({ decision: 'REJECT', reason: 'Tax ID invalid' }),
      { params: { id: 'co_1' } }
    );
    const json = await res.json();
    expect(json.data.status).toBe('REJECTED');
    expect(rejectCompany).toHaveBeenCalledWith('co_1', 'Tax ID invalid');
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run __tests__/api/admin/corporate-approve.test.ts`
Expected: FAIL — route module not found.

- [ ] **Step 3: Implement**

```ts
// app/api/admin/corporate/companies/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authz';
import {
  findCompanyById,
  approveCompany,
  rejectCompany,
} from '@/lib/corporate/company-repo';
import { approveDecisionSchema } from '@/lib/corporate/validators';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = approveDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await findCompanyById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'COMPANY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updated =
      parsed.data.decision === 'APPROVE'
        ? await approveCompany(params.id, admin.id)
        : await rejectCompany(params.id, parsed.data.reason!);

    return NextResponse.json({
      success: true,
      data: updated,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err) {
    return errResponse(err);
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run __tests__/api/admin/corporate-approve.test.ts`
Expected: All passed.

- [ ] **Step 5: Run all corporate tests together to confirm no regression**

Run: `npx vitest run __tests__/lib/corporate __tests__/api/corporate __tests__/api/admin`
Expected: All pass.

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/corporate/companies/[id]/approve/route.ts __tests__/api/admin/corporate-approve.test.ts
git commit -m "feat(corporate): POST /api/admin/corporate/companies/[id]/approve"
```

---

## Chunk 5: UI pages, components, and i18n

**General notes for this chunk:**
- All forms use `react-hook-form` + `@hookform/resolvers/zod` with the validators from `lib/corporate/validators.ts` (already in deps, no new install).
- Toast notifications via `sonner` (existing).
- Page files live under `app/[locale]/...` (i18n routing).
- UI tests are out of scope for Phase 1 (manual smoke test in Chunk 6 covers the golden path).

### Task 19: i18n keys

**Files:**
- Modify: `messages/tr.json`, `messages/en.json`

- [ ] **Step 1: Read current files briefly**

Run: `head -20 messages/tr.json` (just to see top-level keys structure).

- [ ] **Step 2: Add a `corporate` section to both `messages/tr.json` and `messages/en.json`**

Add this top-level key (insert before the closing `}`). Match indentation/style of existing JSON.

**`messages/tr.json` additions:**
```json
{
  "corporate": {
    "signup": {
      "title": "Şirket Hesabı Aç",
      "name": "Şirket Adı",
      "legalName": "Resmi Ünvan",
      "taxId": "Vergi Numarası",
      "contactEmail": "İletişim E-postası",
      "contactPhone": "Telefon",
      "websiteUrl": "Web Sitesi",
      "logoUrl": "Logo URL",
      "password": "Şifre",
      "submit": "Kayıt Ol",
      "successTitle": "Kayıt Alındı",
      "successBody": "Şirket hesabınız onay için admin'e iletildi.",
      "errors": {
        "EMAIL_TAKEN": "Bu e-posta zaten kullanılıyor",
        "TAX_ID_TAKEN": "Bu vergi numarası zaten kayıtlı",
        "SIGNUP_FAILED": "Kayıt sırasında bir hata oluştu"
      }
    },
    "login": {
      "title": "Şirket Girişi",
      "email": "E-posta",
      "password": "Şifre",
      "submit": "Giriş Yap",
      "rejected": "Hesabınız reddedildi",
      "suspended": "Hesabınız askıya alındı"
    },
    "pending": {
      "title": "Onay Bekleniyor",
      "body": "Şirket hesabınız admin onayı bekliyor. Onay sonrası bilgilendirileceksiniz."
    },
    "settings": {
      "profile": {
        "title": "Şirket Profili",
        "save": "Kaydet",
        "saved": "Profil güncellendi"
      },
      "matchingRule": {
        "title": "Eşleştirme Kuralı",
        "ratio": "Eşleştirme Oranı",
        "ratio1x": "1x",
        "ratio2x": "2x",
        "ratio3x": "3x",
        "monthlyBudget": "Aylık Bütçe (TL)",
        "categories": "Uygun Kategoriler",
        "active": "Aktif",
        "save": "Kaydet",
        "saved": "Kural güncellendi",
        "categoryLabels": {
          "tuition": "Okul Ücreti",
          "books": "Kitap",
          "laptop": "Bilgisayar",
          "housing": "Barınma",
          "travel": "Seyahat",
          "emergency": "Acil"
        }
      }
    }
  },
  "admin": {
    "corporate": {
      "title": "Şirket Onay Kuyruğu",
      "name": "Şirket",
      "taxId": "Vergi No",
      "contactEmail": "E-posta",
      "createdAt": "Kayıt Tarihi",
      "approve": "Onayla",
      "reject": "Reddet",
      "rejectReason": "Red Sebebi",
      "noPending": "Onay bekleyen şirket yok"
    }
  }
}
```

**`messages/en.json` additions:** Same structure with English text. Translation pairs:
- `"Şirket Hesabı Aç"` → `"Create Company Account"`
- `"Şirket Adı"` → `"Company Name"`
- `"Resmi Ünvan"` → `"Legal Name"`
- `"Vergi Numarası"` → `"Tax ID"`
- ... (translate all strings naturally)

- [ ] **Step 3: Verify i18n structure**

Run: `npm run i18n:check`
Expected: No missing keys. (This script catches structural mismatches between tr.json and en.json — the prebuild hook also depends on it.)

- [ ] **Step 4: Commit**

```bash
git add messages/tr.json messages/en.json
git commit -m "feat(corporate): add i18n keys for corporate signup/login/settings/admin"
```

---

### Task 20: SignupForm component + signup page

**Files:**
- Create: `components/corporate/SignupForm.tsx`
- Create: `app/[locale]/corporate/signup/page.tsx`

- [ ] **Step 1: Create the form component**

```tsx
// components/corporate/SignupForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { signupSchema, type SignupInput } from '@/lib/corporate/validators';

export function SignupForm() {
  const t = useTranslations('corporate.signup');
  const router = useRouter();
  const form = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });
  const { register, handleSubmit, formState } = form;

  async function onSubmit(values: SignupInput) {
    const res = await fetch('/api/corporate/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!json.success) {
      const errKey = json.error as string;
      const KNOWN = ['EMAIL_TAKEN', 'TAX_ID_TAKEN', 'SIGNUP_FAILED'];
      toast.error(KNOWN.includes(errKey) ? t(`errors.${errKey}` as any) : errKey);
      return;
    }
    toast.success(t('successBody'));
    router.push('/corporate/login');
  }

  // Render fields. Use existing UI primitives in components/ui/ (Input, Button, Label, etc.)
  // — match the styling pattern from components/DonationForm.tsx for consistency.
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label>{t('name')}</label>
        <input {...register('name')} className="input" />
        {formState.errors.name && <p className="text-red-600">{formState.errors.name.message}</p>}
      </div>
      <div>
        <label>{t('taxId')}</label>
        <input {...register('taxId')} className="input" />
        {formState.errors.taxId && <p className="text-red-600">{formState.errors.taxId.message}</p>}
      </div>
      <div>
        <label>{t('contactEmail')}</label>
        <input type="email" {...register('contactEmail')} className="input" />
      </div>
      <div>
        <label>{t('password')}</label>
        <input type="password" {...register('password')} className="input" />
      </div>
      <div>
        <label>{t('legalName')}</label>
        <input {...register('legalName')} className="input" />
      </div>
      <div>
        <label>{t('contactPhone')}</label>
        <input {...register('contactPhone')} className="input" />
      </div>
      <div>
        <label>{t('websiteUrl')}</label>
        <input type="url" {...register('websiteUrl')} className="input" />
      </div>
      <button type="submit" disabled={formState.isSubmitting} className="btn btn-primary">
        {t('submit')}
      </button>
    </form>
  );
}
```

**Note:** The agent should `Read` an existing form component (e.g. `components/DonationForm.tsx`) before writing this to mirror the project's actual styling and UI primitive imports (likely `@/components/ui/input`, `@/components/ui/button`). The skeleton above shows structure — replace `<input className="input" />` with the project's `<Input>` component.

- [ ] **Step 2: Create the page**

```tsx
// app/[locale]/corporate/signup/page.tsx
import { SignupForm } from '@/components/corporate/SignupForm';

export default function CorporateSignupPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl mb-6">Şirket Hesabı Aç</h1>
      <SignupForm />
    </div>
  );
}
```

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev`. Open `http://localhost:3000/tr/corporate/signup`. Form renders, submit a valid payload, expect redirect to `/corporate/login`.

- [ ] **Step 4: Commit**

```bash
git add components/corporate/SignupForm.tsx app/[locale]/corporate/signup/page.tsx
git commit -m "feat(corporate): add SignupForm and /corporate/signup page"
```

---

### Task 21: LoginForm + login page + status redirect

**Files:**
- Create: `components/corporate/LoginForm.tsx`
- Create: `app/[locale]/corporate/login/page.tsx`

LoginForm uses `signIn('credentials', { email, password, redirect: false })` then routes based on status from session.

- [ ] **Step 1: Create the form**

```tsx
// components/corporate/LoginForm.tsx
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function LoginForm() {
  const t = useTranslations('corporate.login');
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Surface ?error=rejected|suspended from previous redirects
  const errorParam = params.get('error');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (!res || res.error) {
      toast.error('Login failed');
      setSubmitting(false);
      return;
    }
    // Pull fresh session to read companyStatus
    const session = await getSession();
    const status = (session?.user as any)?.companyStatus;
    if (status === 'PENDING') router.push('/corporate/pending');
    else if (status === 'APPROVED') router.push('/corporate/settings/matching-rule');
    else if (status === 'REJECTED') router.push('/corporate/login?error=rejected');
    else if (status === 'SUSPENDED') router.push('/corporate/login?error=suspended');
    else router.push('/');
    setSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      {errorParam === 'rejected' && <p className="text-red-600">{t('rejected')}</p>}
      {errorParam === 'suspended' && <p className="text-red-600">{t('suspended')}</p>}
      <div>
        <label>{t('email')}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
      </div>
      <div>
        <label>{t('password')}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
      </div>
      <button type="submit" disabled={submitting} className="btn btn-primary">{t('submit')}</button>
    </form>
  );
}
```

- [ ] **Step 2: Create the page**

```tsx
// app/[locale]/corporate/login/page.tsx
import { LoginForm } from '@/components/corporate/LoginForm';
export default function CorporateLoginPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl mb-6">Şirket Girişi</h1>
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/corporate/LoginForm.tsx app/[locale]/corporate/login/page.tsx
git commit -m "feat(corporate): add LoginForm and /corporate/login page with status routing"
```

---

### Task 22: Pending page

**Files:**
- Create: `components/corporate/PendingBanner.tsx`
- Create: `app/[locale]/corporate/pending/page.tsx`

- [ ] **Step 1: Create files**

```tsx
// components/corporate/PendingBanner.tsx
'use client';
import { useTranslations } from 'next-intl';

export function PendingBanner() {
  const t = useTranslations('corporate.pending');
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-xl font-semibold">{t('title')}</h2>
      <p className="mt-2">{t('body')}</p>
    </div>
  );
}
```

```tsx
// app/[locale]/corporate/pending/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { PendingBanner } from '@/components/corporate/PendingBanner';

export default async function PendingPage() {
  const session = await auth();
  const status = (session?.user as any)?.companyStatus;
  if (!session) redirect('/corporate/login');
  if (status !== 'PENDING') redirect('/corporate/settings/matching-rule');
  return (
    <div className="container mx-auto py-12">
      <PendingBanner />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/corporate/PendingBanner.tsx app/[locale]/corporate/pending/page.tsx
git commit -m "feat(corporate): add /corporate/pending page with status guard"
```

---

### Task 23: ProfileForm + settings/profile page

**Files:**
- Create: `components/corporate/ProfileForm.tsx`
- Create: `app/[locale]/corporate/settings/profile/page.tsx`

- [ ] **Step 1: Create the form**

Same react-hook-form pattern as SignupForm but with `profileUpdateSchema`. Initial values come from `GET /api/corporate/me` (use SWR — already in deps). On submit, `PATCH /api/corporate/me`. Show toast on success/error.

```tsx
// components/corporate/ProfileForm.tsx
'use client';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/corporate/validators';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ProfileForm() {
  const t = useTranslations('corporate.settings.profile');
  const { data, mutate } = useSWR('/api/corporate/me', fetcher);
  const company = data?.data?.company;
  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    values: company
      ? {
          name: company.name,
          legalName: company.legalName ?? undefined,
          contactEmail: company.contactEmail,
          contactPhone: company.contactPhone ?? undefined,
          websiteUrl: company.websiteUrl ?? undefined,
          logoUrl: company.logoUrl ?? undefined,
        }
      : undefined,
  });

  async function onSubmit(values: ProfileUpdateInput) {
    const res = await fetch('/api/corporate/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success(t('saved'));
    mutate();
  }

  if (!company) return <p>Loading...</p>;
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      {/* Same field structure as SignupForm minus password and taxId */}
      {/* taxId is shown read-only (immutable) */}
      <div><label>Tax ID</label><input value={company.taxId} disabled className="input" /></div>
      <div><label>{/*name*/}</label><input {...form.register('name')} className="input" /></div>
      {/* ...legalName, contactEmail, contactPhone, websiteUrl, logoUrl */}
      <button type="submit" className="btn btn-primary">{t('save')}</button>
    </form>
  );
}
```

- [ ] **Step 2: Create page**

```tsx
// app/[locale]/corporate/settings/profile/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ProfileForm } from '@/components/corporate/ProfileForm';

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session) redirect('/corporate/login');
  const status = (session.user as any)?.companyStatus;
  if (status === 'PENDING') redirect('/corporate/pending');
  if (status !== 'APPROVED') redirect('/corporate/login');
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl mb-6">Şirket Profili</h1>
      <ProfileForm />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/corporate/ProfileForm.tsx app/[locale]/corporate/settings/profile/page.tsx
git commit -m "feat(corporate): add ProfileForm and settings/profile page"
```

---

### Task 24: MatchingRuleForm + settings/matching-rule page

**Files:**
- Create: `components/corporate/MatchingRuleForm.tsx`
- Create: `app/[locale]/corporate/settings/matching-rule/page.tsx`

The form has: **radio group for ratio (1/2/3)**, **number input for budget**, **6 checkboxes for categories**, **toggle for active**. Submits PUT to `/api/corporate/matching-rule`. Initial values via SWR; if no rule exists yet, the form starts with sensible defaults (ratio: 2, budget: 0, no categories, active: true).

The non-obvious bit: the `eligibleCategories` field is `string[]`. In react-hook-form, a multi-checkbox group with `register('eligibleCategories')` binds each checkbox to the same array — RHF aggregates checked values automatically when each checkbox has the same `name` and a `value` attribute. The skeleton below uses that pattern.

- [ ] **Step 1: Create the form**

```tsx
// components/corporate/MatchingRuleForm.tsx
'use client';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { matchingRuleSchema, type MatchingRuleInput } from '@/lib/corporate/validators';
import { ELIGIBLE_CATEGORIES } from '@/lib/corporate/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MatchingRuleForm() {
  const t = useTranslations('corporate.settings.matchingRule');
  const { data, mutate } = useSWR('/api/corporate/matching-rule', fetcher);
  const existing = data?.data; // null if no rule yet

  const form = useForm<MatchingRuleInput>({
    resolver: zodResolver(matchingRuleSchema),
    values: existing
      ? {
          ratio: existing.ratio,
          monthlyBudgetTRY: existing.monthlyBudgetTRY,
          eligibleCategories: existing.eligibleCategories,
          active: existing.active,
        }
      : {
          ratio: 2,
          monthlyBudgetTRY: 0,
          eligibleCategories: [],
          active: true,
        },
  });
  const { register, handleSubmit, formState } = form;

  async function onSubmit(values: MatchingRuleInput) {
    const res = await fetch('/api/corporate/matching-rule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success(t('saved'));
    mutate();
  }

  if (!data) return <p>Loading...</p>;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <fieldset>
        <legend className="font-semibold mb-2">{t('ratio')}</legend>
        <div className="flex gap-4">
          {[1, 2, 3].map((r) => (
            <label key={r} className="flex items-center gap-1">
              <input
                type="radio"
                value={r}
                {...register('ratio', { valueAsNumber: true })}
              />
              {t(`ratio${r}x` as any)}
            </label>
          ))}
        </div>
        {formState.errors.ratio && <p className="text-red-600">{formState.errors.ratio.message}</p>}
      </fieldset>

      <div>
        <label className="font-semibold">{t('monthlyBudget')}</label>
        <input
          type="number"
          min={1}
          step={1}
          {...register('monthlyBudgetTRY', { valueAsNumber: true })}
          className="input w-full"
        />
        {formState.errors.monthlyBudgetTRY && (
          <p className="text-red-600">{formState.errors.monthlyBudgetTRY.message}</p>
        )}
      </div>

      <fieldset>
        <legend className="font-semibold mb-2">{t('categories')}</legend>
        <div className="grid grid-cols-2 gap-2">
          {ELIGIBLE_CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={cat}
                {...register('eligibleCategories')}
              />
              {t(`categoryLabels.${cat}` as any)}
            </label>
          ))}
        </div>
        {formState.errors.eligibleCategories && (
          <p className="text-red-600">{formState.errors.eligibleCategories.message}</p>
        )}
      </fieldset>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('active')} />
        <span className="font-semibold">{t('active')}</span>
      </label>

      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="btn btn-primary"
      >
        {t('save')}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create the page (with explicit auth gate)**

```tsx
// app/[locale]/corporate/settings/matching-rule/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { MatchingRuleForm } from '@/components/corporate/MatchingRuleForm';

export default async function MatchingRuleSettingsPage() {
  const session = await auth();
  if (!session) redirect('/corporate/login');
  const status = (session.user as any)?.companyStatus;
  if (status === 'PENDING') redirect('/corporate/pending');
  if (status !== 'APPROVED') redirect('/corporate/login');
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl mb-6">Eşleştirme Kuralı</h1>
      <MatchingRuleForm />
    </div>
  );
}
```

- [ ] **Step 3: Manual smoke**

`npm run dev` → log in as an APPROVED company owner → `/tr/corporate/settings/matching-rule` → set ratio 2, budget 50000, check `tuition`+`books`, leave active checked, submit. Reload page; values persist.

- [ ] **Step 4: Commit**

```bash
git add components/corporate/MatchingRuleForm.tsx app/[locale]/corporate/settings/matching-rule/page.tsx
git commit -m "feat(corporate): add MatchingRuleForm and settings/matching-rule page"
```

---

### Task 25: Admin company queue page

**Files:**
- Create: `components/corporate/AdminCompanyList.tsx`
- Create: `components/corporate/AdminCompanyRow.tsx`
- Create: `app/[locale]/admin/corporate/page.tsx`

`AdminCompanyList` fetches `/api/admin/corporate/companies?status=PENDING` via SWR and renders one `AdminCompanyRow` per company. Each row has **Onayla** and **Reddet** buttons. **Onayla** calls the approve endpoint directly. **Reddet** opens a reject-reason dialog and posts `{ decision: 'REJECT', reason }` only after the admin confirms.

- [ ] **Step 1: Create AdminCompanyList**

```tsx
// components/corporate/AdminCompanyList.tsx
'use client';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { AdminCompanyRow } from './AdminCompanyRow';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AdminCompanyList() {
  const t = useTranslations('admin.corporate');
  const { data, mutate } = useSWR('/api/admin/corporate/companies?status=PENDING', fetcher);
  const companies = data?.data ?? [];

  if (!data) return <p>Loading...</p>;
  if (companies.length === 0) return <p>{t('noPending')}</p>;

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2">{t('name')}</th>
          <th className="text-left p-2">{t('taxId')}</th>
          <th className="text-left p-2">{t('contactEmail')}</th>
          <th className="text-left p-2">{t('createdAt')}</th>
          <th className="text-left p-2"></th>
        </tr>
      </thead>
      <tbody>
        {companies.map((c: any) => (
          <AdminCompanyRow key={c.id} company={c} onChange={() => mutate()} />
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Create AdminCompanyRow**

Use the existing Dialog primitive from `components/ui/dialog.tsx` (Radix-based, already in deps). The reject flow: click **Reddet** → dialog opens with a textarea → admin types reason → click "Reddet" inside dialog → POST → on success: close dialog, toast, `onChange()` to refresh list.

```tsx
// components/corporate/AdminCompanyRow.tsx
'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

type Props = {
  company: { id: string; name: string; taxId: string; contactEmail: string; createdAt: string };
  onChange: () => void;
};

export function AdminCompanyRow({ company, onChange }: Props) {
  const t = useTranslations('admin.corporate');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function decide(decision: 'APPROVE' | 'REJECT', body: any = {}) {
    setSubmitting(true);
    const res = await fetch(`/api/admin/corporate/companies/${company.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, ...body }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    toast.success(decision === 'APPROVE' ? 'Onaylandı' : 'Reddedildi');
    setRejectOpen(false);
    setReason('');
    onChange();
  }

  return (
    <tr className="border-b">
      <td className="p-2">{company.name}</td>
      <td className="p-2">{company.taxId}</td>
      <td className="p-2">{company.contactEmail}</td>
      <td className="p-2">{new Date(company.createdAt).toLocaleDateString()}</td>
      <td className="p-2 flex gap-2">
        <button
          className="btn btn-primary"
          onClick={() => decide('APPROVE')}
          disabled={submitting}
        >
          {t('approve')}
        </button>

        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogTrigger asChild>
            <button className="btn btn-destructive" disabled={submitting}>
              {t('reject')}
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('rejectReason')}</DialogTitle>
            </DialogHeader>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded p-2"
              rows={4}
            />
            <DialogFooter>
              <button
                className="btn btn-destructive"
                disabled={!reason.trim() || submitting}
                onClick={() => decide('REJECT', { reason: reason.trim() })}
              >
                {t('reject')}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}
```

**Note:** The exact Dialog API surface (`DialogContent`, `DialogHeader`, etc.) is whatever `components/ui/dialog.tsx` exports — the agent should `Read` that file first and adjust if the shape differs (e.g. older shadcn versions name them `DialogPrimitive.*`). The `disabled={!reason.trim()}` mirrors the server-side `approveDecisionSchema.refine` so the client cannot submit a REJECT with an empty reason.

- [ ] **Step 3: Create the page**

```tsx
// app/[locale]/admin/corporate/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminCompanyList } from '@/components/corporate/AdminCompanyList';

export default async function AdminCorporatePage() {
  const session = await auth();
  if (!session) redirect('/login');
  if ((session.user as any)?.role !== 'admin') redirect('/');
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl mb-6">Şirket Onay Kuyruğu</h1>
      <AdminCompanyList />
    </div>
  );
}
```

- [ ] **Step 4: Manual smoke**

`npm run dev` → log in as admin (email in `ADMIN_EMAILS` env) → open `/tr/admin/corporate`. The pending company from the signup smoke test should appear. Click **Onayla**. Row disappears. Refresh page; queue is empty. Repeat with another signup → click **Reddet**, leave reason blank, button is disabled. Type "Test reject reason", submit; toast shows.

- [ ] **Step 5: Commit**

```bash
git add components/corporate/AdminCompanyList.tsx components/corporate/AdminCompanyRow.tsx app/[locale]/admin/corporate/page.tsx
git commit -m "feat(corporate): add admin approval queue UI with reject-reason dialog"
```

---

### Task 26: Update Sidebar with corporate links

**Files:**
- Modify: `components/corporate/Sidebar.tsx`

- [ ] **Step 1: Read existing Sidebar**

Run: `cat components/corporate/Sidebar.tsx`. Note its existing items.

- [ ] **Step 2: Add two new items in the relevant render block**

- "Profil" → `/corporate/settings/profile`
- "Eşleştirme Kuralı" → `/corporate/settings/matching-rule`

Reuse existing item-render pattern. If the sidebar already has these or similar links, only add what's missing.

- [ ] **Step 3: Commit**

```bash
git add components/corporate/Sidebar.tsx
git commit -m "feat(corporate): add Profile and MatchingRule links to corporate sidebar"
```

---

## Chunk 6: Smoke test + final verification

### Task 27: Manual end-to-end smoke test

**Files:** None (verification only).

- [ ] **Step 1: Ensure local DB is reachable**

Run: `npx prisma db push` (creates collections in MongoDB if connection is configured). If `MONGO_URL` is not set, document the failure and skip — production validation will run on staging.

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`. Confirm console is clean (no red errors).

- [ ] **Step 3: Walk the golden path** in a browser

1. Open `http://localhost:3000/tr/corporate/signup`. Fill the form with a unique tax ID and submit. Expect redirect to `/tr/corporate/login` with a success toast.
2. Log in with the new credentials at `/tr/corporate/login`. Expect redirect to `/tr/corporate/pending`.
3. In a separate session/incognito, log in as an admin user (set their email via `ADMIN_EMAILS` env var). Open `/tr/admin/corporate`. The new company should appear in the queue. Click "Onayla".
4. Back in the company-owner session, log out and log in again. Expect redirect to `/tr/corporate/settings/matching-rule`.
5. Fill the matching rule (ratio: 2x, budget: 50000, categories: tuition+books, active: true). Submit. Expect saved toast.
6. Open another tab and run a curl request to verify simulate API:

```bash
# Replace <SESSION_COOKIE> with the authjs.session-token cookie value
curl -X POST http://localhost:3000/api/corporate/matching/simulate \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=<SESSION_COOKIE>" \
  -d '{"donationAmountTRY": 100, "category": "tuition"}'
```

Expected response: `{ "success": true, "data": { "matched": true, "matchedAmountTRY": 200, "ratioApplied": 2, "remainingBudgetTRY": 49800 } }`

7. Toggle the rule's `active` field to `false` via the UI. Re-run the curl request. Expected: `{ "success": true, "data": { "matched": false, "reason": "RULE_INACTIVE" } }`.
8. Re-activate the rule. Try simulate with `category: "travel"`. Expected: `{ "matched": false, "reason": "CATEGORY_INELIGIBLE" }`.

- [ ] **Step 4: Run the full test suite**

Run: `npx vitest run`
Expected: All Phase 1 tests pass; pre-existing tests still pass.

- [ ] **Step 5: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No new errors. Pre-existing errors in unrelated files are acceptable.

- [ ] **Step 6: Document Phase 1 completion**

Create `docs/superpowers/plans/2026-05-07-corporate-matching-phase1-status.md` (a sibling to this plan, **not** a modification of the spec — the spec stays a spec) with: shipped scope, link back to the plan, brief notes on anything skipped or deferred to Phase 2.

```bash
git add docs/superpowers/plans/2026-05-07-corporate-matching-phase1-status.md
git commit -m "docs: mark Phase 1 corporate matching foundation as shipped"
```

---

## Done

Phase 1 ships: data layer, self-service onboarding, admin approval, single matching rule per company, and a pure simulate engine — exactly the foundation Phases 2 (live trigger + employee activation + owner approval workflow) and 3 (dashboard wiring + ESG PDF + sponsor badges) need.

**Files created:** 27 (5 lib, 8 tests, 8 API route files, 7 page/component files, plus i18n + types + auth diff).
**Test count added:** ~50 unit + integration assertions.
**No new packages.**
