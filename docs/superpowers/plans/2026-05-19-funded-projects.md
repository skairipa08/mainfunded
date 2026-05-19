# FundEd Projects Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "FundEd Projects" module enabling student teams and institutions to apply for verified, milestone-based project funding with escrow payments, sponsor discovery, and admin oversight.

**Architecture:** Separate module alongside existing campaigns system — new MongoDB collections (`projects`, `project_members`, `milestones`, `project_escrow`, `project_verification`, `sponsor_project_follows`) accessed via `getDb()` following existing patterns. API routes under `/api/projects/` and `/api/admin/projects/`. Frontend under `/app/[locale]/projects/`.

**Tech Stack:** Next.js 14 App Router, TypeScript, MongoDB (direct via `getDb()`), NextAuth (`requireUser` / `requireRole`), Iyzico (soft-lock escrow), Cloudinary (file upload), Resend (email), Zod (validation), React Hook Form, Tailwind CSS, Radix UI, Recharts.

---

## Chunk 1: Foundation — Types, Validators, Lib Utilities

### File Map
- Create: `types/projects.ts` — all TypeScript types/interfaces/enums
- Create: `lib/validators/project.ts` — Zod schemas
- Create: `lib/project-risk.ts` — pure risk score function (unit-testable)
- Create: `lib/project-state-machine.ts` — status transition helpers
- Create: `lib/project-escrow.ts` — escrow calculation helpers

---

### Task 1: TypeScript Types

**Files:**
- Create: `types/projects.ts`

- [ ] **Step 1: Create the types file**

```typescript
// types/projects.ts

export type ProjectType =
  | 'club' | 'team' | 'research' | 'competition' | 'social' | 'event' | 'conference'

export type ProjectStatus =
  | 'Draft' | 'Pending' | 'Verified' | 'Rejected' | 'Published' | 'Suspended' | 'Completed'

export type OwnerType = 'student' | 'institution'

export type SchoolLevel = 'high_school' | 'university'

export type MilestoneStatus =
  | 'Locked'          // previous milestone not done
  | 'EvidenceRequired' // system: funding threshold hit, team can upload
  | 'UnlockRequested'  // team: evidence uploaded, awaiting admin
  | 'Approved'         // admin approved, payout triggered
  | 'Paid'             // Iyzico payout confirmed

export type MemberRole = 'leader' | 'member' | 'advisor'

export type EscrowTxType = 'collect' | 'release' | 'refund'

export interface BudgetItem {
  name: string
  amount: number
  category: string
}

export interface TimelineItem {
  week: number
  task: string
}

export interface Project {
  _id?: string
  project_id: string
  title: string
  description: string
  type: ProjectType
  status: ProjectStatus
  owner_id: string        // NextAuth user.id
  owner_type: OwnerType
  school_name: string
  school_email: string
  school_level: SchoolLevel
  club_name?: string
  domain: string[]
  advisor_name?: string
  advisor_email?: string
  advisor_token?: string
  advisor_approved_at?: string
  target_budget: number
  budget_items: BudgetItem[]
  expected_outputs: string[]
  timeline: TimelineItem[]
  files: string[]
  video_url?: string
  risk_score: number
  created_at: string
  updated_at: string
  published_at?: string
}

export interface ProjectMember {
  _id?: string
  project_id: string
  user_id?: string
  name: string
  email: string
  role: MemberRole
  verified_at?: string
  created_at: string
}

export interface Milestone {
  _id?: string
  milestone_id: string
  project_id: string
  order: number
  title: string
  description: string
  percentage: number
  status: MilestoneStatus
  evidence_files: string[]
  evidence_note?: string
  admin_note?: string
  approved_at?: string
  approved_by?: string
  created_at: string
}

export interface ProjectEscrow {
  _id?: string
  project_id: string
  total_collected: number
  total_released: number
  pending_release: number
  iyzico_escrow_ref?: string
  created_at: string
  updated_at: string
}

export interface EscrowTransaction {
  _id?: string
  tx_id: string
  project_id: string    // denormalized for fast donor-level queries
  donor_id?: string     // present on collect transactions
  milestone_id?: string // present on release transactions
  original_tx_id?: string // present on refund transactions
  type: EscrowTxType
  amount: number
  currency: string
  iyzico_payment_id?: string
  status: string
  created_at: string
}

export interface ProjectVerification {
  _id?: string
  project_id: string
  student_email_verified: boolean
  school_doc_verified: boolean
  advisor_approved: boolean
  admin_reviewed_at?: string
  admin_reviewed_by?: string
  rejection_reason?: string
  created_at: string
}

export interface SponsorProjectFollow {
  _id?: string
  donor_id: string
  project_id: string
  followed_at: string
}

export interface ProjectFilters {
  type?: ProjectType[]
  domain?: string[]
  school_level?: SchoolLevel
  city?: string
  budget_min?: number
  budget_max?: number
  status?: 'Published' | 'Completed'
  has_advisor?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface ESGMetrics {
  total_projects_supported: number
  total_students_reached: number
  completed_projects_ratio: number
  active_projects: number
  domain_breakdown: { domain: string; count: number }[]
  total_amount_donated: number
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```
Expected: No errors relating to `types/projects.ts`

- [ ] **Step 3: Commit**

```bash
git add types/projects.ts
git commit -m "feat(projects): add TypeScript types"
```

---

### Task 2: Zod Validators

**Files:**
- Create: `lib/validators/project.ts`

- [ ] **Step 1: Create validators**

```typescript
// lib/validators/project.ts
import { z } from 'zod'

const budgetItemSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
})

const timelineItemSchema = z.object({
  week: z.number().int().positive(),
  task: z.string().min(1),
})

export const projectCreateSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(2000),
  type: z.enum(['club', 'team', 'research', 'competition', 'social', 'event', 'conference']),
  school_name: z.string().min(2),
  school_email: z.string().email(),
  school_level: z.enum(['high_school', 'university']),
  club_name: z.string().optional(),
  domain: z.array(z.string()).min(1).max(5),
  advisor_name: z.string().optional(),
  advisor_email: z.string().email().optional(),
  target_budget: z.number().positive().max(10_000_000),
  budget_items: z.array(budgetItemSchema).min(1).max(20),
  expected_outputs: z.array(z.string().min(1)).min(1).max(10),
  timeline: z.array(timelineItemSchema).min(1).max(52),
  files: z.array(z.string().url()).max(10),
  video_url: z.string().url().optional(),
})

export const projectUpdateSchema = projectCreateSchema.partial()

export const milestoneEvidenceSchema = z.object({
  evidence_files: z.array(z.string().url()).min(1).max(5),
  evidence_note: z.string().min(10).max(1000),
})

export const adminVerifySchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejection_reason: z.string().optional(),
})

export const adminMilestoneSchema = z.object({
  action: z.enum(['approve', 'reject']),
  admin_note: z.string().optional(),
})
```

- [ ] **Step 2: Commit**

```bash
git add lib/validators/project.ts
git commit -m "feat(projects): add Zod validators"
```

---

### Task 3: Risk Score Utility

**Files:**
- Create: `lib/project-risk.ts`

- [ ] **Step 1: Write the failing test**

Since there is no test runner set up, create a simple test script:

```typescript
// lib/__tests__/project-risk.test.ts
import { calculateRiskScore } from '../project-risk'

describe('calculateRiskScore', () => {
  const baseProject = {
    files: ['https://example.com/doc.pdf'],
    budget_items: [
      { name: 'a', amount: 100, category: 'x' },
      { name: 'b', amount: 200, category: 'y' },
      { name: 'c', amount: 300, category: 'z' },
    ],
    members: [{ name: 'A' }, { name: 'B' }],
    timeline: [{ week: 1, task: 't1' }, { week: 2, task: 't2' }, { week: 3, task: 't3' }],
    video_url: 'https://youtube.com/watch?v=abc',
    account_age_days: 30,
  }

  const baseVerification = {
    advisor_approved: false,
    student_email_verified: false,
    school_doc_verified: false,
  }

  it('returns 0 for completely empty project', () => {
    expect(calculateRiskScore(
      { files: [], budget_items: [], members: [], timeline: [], account_age_days: 0 },
      { advisor_approved: false, student_email_verified: false, school_doc_verified: false }
    )).toBe(0)
  })

  it('adds 25 for advisor_approved', () => {
    const score = calculateRiskScore(baseProject, { ...baseVerification, advisor_approved: true })
    expect(score).toBeGreaterThanOrEqual(25)
  })

  it('caps at 100', () => {
    const score = calculateRiskScore(baseProject, {
      advisor_approved: true,
      student_email_verified: true,
      school_doc_verified: true,
    })
    expect(score).toBeLessThanOrEqual(100)
  })

  it('subtracts 10 for account younger than 7 days', () => {
    const withNew = calculateRiskScore(
      { ...baseProject, account_age_days: 3 },
      { advisor_approved: true, student_email_verified: false, school_doc_verified: false }
    )
    const withOld = calculateRiskScore(
      { ...baseProject, account_age_days: 30 },
      { advisor_approved: true, student_email_verified: false, school_doc_verified: false }
    )
    expect(withOld - withNew).toBe(10)
  })
})
```

- [ ] **Step 2: Check if Jest is configured**

```bash
cat package.json | grep -E '"jest"|"vitest"|"test"'
```

If no test runner exists, add Jest:
```bash
npm install -D jest @types/jest ts-jest
npx ts-jest config:init
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
npx jest lib/__tests__/project-risk.test.ts 2>&1 | tail -10
```
Expected: FAIL — `Cannot find module '../project-risk'`

- [ ] **Step 4: Implement risk score function**

```typescript
// lib/project-risk.ts

interface ProjectRiskInput {
  files: any[]
  budget_items: any[]
  members: any[]
  timeline: any[]
  video_url?: string
  account_age_days: number
}

interface VerificationRiskInput {
  advisor_approved: boolean
  student_email_verified: boolean
  school_doc_verified: boolean
}

export function calculateRiskScore(
  project: ProjectRiskInput,
  verification: VerificationRiskInput
): number {
  let score = 0

  if (verification.advisor_approved)        score += 25
  if (verification.student_email_verified)  score += 15
  if (verification.school_doc_verified)     score += 20

  if (project.files.length >= 1)            score += 10
  if (project.budget_items.length >= 3)     score += 10
  if (project.members.length > 1)           score += 10
  if (project.timeline.length >= 3)         score += 5
  if (project.video_url)                    score += 5

  if (project.account_age_days < 7)         score -= 10

  return Math.max(0, Math.min(100, score))
}

export function getRiskLevel(score: number): 'high' | 'medium' | 'normal' {
  if (score < 40) return 'high'
  if (score < 60) return 'medium'
  return 'normal'
}
```

- [ ] **Step 5: Run tests to confirm pass**

```bash
npx jest lib/__tests__/project-risk.test.ts 2>&1 | tail -10
```
Expected: PASS, 4 tests passing

- [ ] **Step 6: Commit**

```bash
git add lib/project-risk.ts lib/__tests__/project-risk.test.ts
git commit -m "feat(projects): add risk score utility with tests"
```

---

### Task 4: State Machine & Escrow Helpers

**Files:**
- Create: `lib/project-state-machine.ts`
- Create: `lib/project-escrow.ts`

- [ ] **Step 1: Create state machine**

```typescript
// lib/project-state-machine.ts
import type { ProjectStatus, MilestoneStatus } from '@/types/projects'

export const PROJECT_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  Draft:     ['Pending'],
  Pending:   ['Verified', 'Rejected'],
  Verified:  ['Published', 'Rejected'],
  Rejected:  [],
  Published: ['Suspended', 'Completed'],
  Suspended: ['Published'],
  Completed: [],
}

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return PROJECT_TRANSITIONS[from]?.includes(to) ?? false
}

export const MILESTONE_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
  Locked:           ['EvidenceRequired'],
  EvidenceRequired: ['UnlockRequested'],
  UnlockRequested:  ['Approved', 'EvidenceRequired'],
  Approved:         ['Paid'],
  Paid:             [],
}

export function canMilestoneTransition(from: MilestoneStatus, to: MilestoneStatus): boolean {
  return MILESTONE_TRANSITIONS[from]?.includes(to) ?? false
}
```

- [ ] **Step 2: Create escrow helpers**

```typescript
// lib/project-escrow.ts

export function calculateMilestoneRelease(
  totalCollected: number,
  milestonePercentage: number
): number {
  return Math.round((totalCollected * milestonePercentage) / 100 * 100) / 100
}

export function calculateRefundPerDonor(
  donorAmount: number,
  totalCollected: number,
  totalReleased: number
): number {
  if (totalCollected === 0) return 0
  const refundablePool = totalCollected - totalReleased
  return Math.round((donorAmount / totalCollected) * refundablePool * 100) / 100
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/project-state-machine.ts lib/project-escrow.ts
git commit -m "feat(projects): add state machine and escrow helpers"
```

---

## Chunk 2: Core Project API

### File Map
- Create: `app/api/projects/route.ts` — GET list, POST create
- Create: `app/api/projects/my/route.ts` — GET owner's projects
- Create: `app/api/projects/[id]/route.ts` — GET, PATCH, DELETE
- Create: `app/api/projects/[id]/submit/route.ts` — POST Draft→Pending
- Create: `app/api/projects/[id]/advisor-approve/route.ts` — GET token approval
- Create: `app/api/projects/[id]/members/route.ts` — GET list, POST add

---

### Task 5: Project List & Create

**Files:**
- Create: `app/api/projects/route.ts`

- [ ] **Step 1: Create GET + POST handler**

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { projectCreateSchema } from '@/lib/validators/project'
import { calculateRiskScore } from '@/lib/project-risk'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(24, parseInt(searchParams.get('limit') || '12'))
    const skip = (page - 1) * limit

    const query: any = { status: 'Published' }

    const typeParam = searchParams.get('type')
    if (typeParam) query.type = { $in: typeParam.split(',') }

    const domainParam = searchParams.get('domain')
    if (domainParam) query.domain = { $in: domainParam.split(',') }

    const schoolLevel = searchParams.get('school_level')
    if (schoolLevel) query.school_level = schoolLevel

    const budgetMin = searchParams.get('budget_min')
    const budgetMax = searchParams.get('budget_max')
    if (budgetMin || budgetMax) {
      query.target_budget = {}
      if (budgetMin) query.target_budget.$gte = parseFloat(budgetMin)
      if (budgetMax) query.target_budget.$lte = parseFloat(budgetMax)
    }

    const city = searchParams.get('city')
    if (city) query.city = city

    const search = searchParams.get('search')
    if (search) query.$text = { $search: search }

    const db = await getDb()
    const [projects, total] = await Promise.all([
      db.collection('projects').find(query).sort({ published_at: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('projects').countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    logger.error('[Projects GET]', error)
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()

    const validation = projectCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: validation.error.errors } },
        { status: 400 }
      )
    }

    const data = validation.data
    const db = await getDb()

    // Determine owner_type from session (institution role or student)
    const sessionUser = user as any
    const ownerType = sessionUser.account_type === 'institution' ? 'institution' : 'student'

    const project = {
      project_id: `proj_${crypto.randomBytes(8).toString('hex')}`,
      status: 'Draft',
      owner_id: user.id,
      owner_type: ownerType,
      risk_score: 0,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await db.collection('projects').insertOne(project)

    // Create default 3 milestones
    // Default milestones created at Draft stage with placeholder titles.
    // Teams update title/description during wizard Step 3 via PATCH /api/projects/[id].
    const milestones = [
      { order: 1, title: 'Aşama 1 — Hazırlık', percentage: 20, description: 'Başvuru sırasında düzenleyebilirsiniz.' },
      { order: 2, title: 'Aşama 2 — Geliştirme', percentage: 30, description: 'Başvuru sırasında düzenleyebilirsiniz.' },
      { order: 3, title: 'Aşama 3 — Teslim', percentage: 50, description: 'Başvuru sırasında düzenleyebilirsiniz.' },
    ].map(m => ({
      milestone_id: `ms_${crypto.randomBytes(6).toString('hex')}`,
      project_id: project.project_id,
      status: 'Locked',
      evidence_files: [],
      created_at: new Date().toISOString(),
      ...m,
    }))

    await db.collection('milestones').insertMany(milestones)

    logger.info(`[Projects POST] Created ${project.project_id} by ${user.id}`)

    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (error: any) {
    logger.error('[Projects POST]', error)
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 2: Manual test — create a project**

```bash
# Start dev server
npm run dev

# POST to create project (replace TOKEN with a valid session cookie)
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN" \
  -d '{
    "title": "Test Projesi",
    "description": "Bu bir test projesidir ve yeterince uzundur.",
    "type": "team",
    "school_name": "Test Üniversitesi",
    "school_email": "test@uni.edu.tr",
    "school_level": "university",
    "domain": ["mühendislik"],
    "target_budget": 50000,
    "budget_items": [{"name": "Ekipman", "amount": 30000, "category": "donanım"}],
    "expected_outputs": ["Prototip"],
    "timeline": [{"week": 1, "task": "Başlangıç"}],
    "files": []
  }'
```
Expected: `{"success": true, "data": {"project_id": "proj_...", "status": "Draft"}}`

- [ ] **Step 3: Commit**

```bash
git add app/api/projects/route.ts
git commit -m "feat(projects): add GET list and POST create endpoints"
```

---

### Task 6: My Projects + Detail + Update + Delete

**Files:**
- Create: `app/api/projects/my/route.ts`
- Create: `app/api/projects/[id]/route.ts`

- [ ] **Step 1: Create /my endpoint**

```typescript
// app/api/projects/my/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const projects = await db.collection('projects')
      .find({ owner_id: user.id })
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json({ success: true, data: projects })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 2: Create [id] route**

```typescript
// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { projectUpdateSchema } from '@/lib/validators/project'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

async function getProjectOrThrow(db: any, projectId: string) {
  const project = await db.collection('projects').findOne({ project_id: projectId })
  if (!project) {
    const err: any = new Error('Project not found'); err.statusCode = 404; throw err
  }
  return project
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const db = await getDb()
    const project = await getProjectOrThrow(db, params.id)

    const [members, milestones, escrow] = await Promise.all([
      db.collection('project_members').find({ project_id: params.id }).toArray(),
      db.collection('milestones').find({ project_id: params.id }).sort({ order: 1 }).toArray(),
      db.collection('project_escrow').findOne({ project_id: params.id }),
    ])

    return NextResponse.json({ success: true, data: { ...project, members, milestones, escrow } })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const db = await getDb()
    const project = await getProjectOrThrow(db, params.id)

    if (project.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (project.status !== 'Draft') {
      return NextResponse.json({ error: 'Only Draft projects can be updated' }, { status: 400 })
    }

    const body = await req.json()
    const validation = projectUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: validation.error.errors } }, { status: 400 })
    }

    await db.collection('projects').updateOne(
      { project_id: params.id },
      { $set: { ...validation.data, updated_at: new Date().toISOString() } }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const db = await getDb()
    const project = await getProjectOrThrow(db, params.id)

    if (project.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (project.status !== 'Draft') {
      return NextResponse.json({ error: 'Only Draft projects can be deleted' }, { status: 400 })
    }

    await Promise.all([
      db.collection('projects').deleteOne({ project_id: params.id }),
      db.collection('milestones').deleteMany({ project_id: params.id }),
      db.collection('project_members').deleteMany({ project_id: params.id }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/projects/my/route.ts app/api/projects/[id]/route.ts
git commit -m "feat(projects): add my-projects, detail, update, delete endpoints"
```

---

### Task 7: Submit + Advisor Approval + Members

**Files:**
- Create: `app/api/projects/[id]/submit/route.ts`
- Create: `app/api/projects/[id]/advisor-approve/route.ts`
- Create: `app/api/projects/[id]/members/route.ts`

- [ ] **Step 1: Submit endpoint (Draft → Pending)**

```typescript
// app/api/projects/[id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { calculateRiskScore } from '@/lib/project-risk'
import { sendAdvisorApprovalEmail } from '@/lib/email-service'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (project.status !== 'Draft') return NextResponse.json({ error: 'Only Draft projects can be submitted' }, { status: 400 })

    const members = await db.collection('project_members').find({ project_id: params.id }).toArray()

    // Calculate risk score
    const accountCreatedAt = await db.collection('users')
      .findOne({ _id: user.id }, { projection: { createdAt: 1 } })
    const accountAgeDays = accountCreatedAt?.createdAt
      ? Math.floor((Date.now() - new Date(accountCreatedAt.createdAt).getTime()) / 86400000)
      : 0

    const riskScore = calculateRiskScore(
      {
        files: project.files,
        budget_items: project.budget_items,
        members,
        timeline: project.timeline,
        video_url: project.video_url,
        account_age_days: accountAgeDays,
      },
      { advisor_approved: false, student_email_verified: false, school_doc_verified: false }
    )

    // Generate advisor token if advisor email provided
    const advisorToken = project.advisor_email
      ? crypto.randomBytes(32).toString('hex')
      : undefined

    await db.collection('projects').updateOne(
      { project_id: params.id },
      { $set: {
          status: 'Pending',
          risk_score: riskScore,
          advisor_token: advisorToken,
          updated_at: new Date().toISOString(),
      }}
    )

    // Create verification record
    await db.collection('project_verification').insertOne({
      project_id: params.id,
      student_email_verified: false,
      school_doc_verified: false,
      advisor_approved: false,
      created_at: new Date().toISOString(),
    })

    // Send advisor approval email
    if (project.advisor_email && advisorToken) {
      await sendAdvisorApprovalEmail({
        advisorEmail: project.advisor_email,
        advisorName: project.advisor_name || 'Danışman',
        projectTitle: project.title,
        projectId: params.id,
        token: advisorToken,
      })
    }

    return NextResponse.json({ success: true, data: { risk_score: riskScore } })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 2: Advisor approval endpoint**

```typescript
// app/api/projects/[id]/advisor-approve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = new URL(req.url).searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    const db = await getDb()
    const project = await db.collection('projects').findOne({
      project_id: params.id,
      advisor_token: token,
    })

    if (!project) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
    if (project.advisor_approved_at) return NextResponse.json({ success: true, message: 'Already approved' })

    const now = new Date().toISOString()
    await Promise.all([
      db.collection('projects').updateOne(
        { project_id: params.id },
        { $set: { advisor_approved_at: now, advisor_token: null, updated_at: now } }
      ),
      db.collection('project_verification').updateOne(
        { project_id: params.id },
        { $set: { advisor_approved: true } }
      ),
    ])

    // Redirect to a confirmation page
    return NextResponse.redirect(new URL(`/projects/${params.id}?advisor_approved=1`, req.url))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

- [ ] **Step 3: Members endpoint**

```typescript
// app/api/projects/[id]/members/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { z } from 'zod'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const addMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['leader', 'member', 'advisor']),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    const members = await db.collection('project_members')
      .find({ project_id: params.id })
      .toArray()
    return NextResponse.json({ success: true, data: members })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const validation = addMemberSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: validation.error.errors } }, { status: 400 })
    }

    const member = {
      member_id: `mem_${crypto.randomBytes(6).toString('hex')}`,
      project_id: params.id,
      ...validation.data,
      created_at: new Date().toISOString(),
    }

    await db.collection('project_members').insertOne(member)
    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 4: Add sendAdvisorApprovalEmail to lib/email-service.ts**

First read `lib/email-service.ts` to understand its structure, then append the new function at the end of the file (do not create a new file — the Resend instance is already initialized there):

```typescript
export async function sendAdvisorApprovalEmail(params: {
  advisorEmail: string
  advisorName: string
  projectTitle: string
  projectId: string
  token: string
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const approvalUrl = `${baseUrl}/api/projects/${params.projectId}/advisor-approve?token=${params.token}`

  // Use existing Resend instance from this file
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@funded.com',
    to: params.advisorEmail,
    subject: `Proje Onayı: ${params.projectTitle}`,
    html: `
      <h2>Sayın ${params.advisorName},</h2>
      <p><strong>${params.projectTitle}</strong> projesi için danışman onayınız bekleniyor.</p>
      <p><a href="${approvalUrl}" style="background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Projeyi Onayla</a></p>
      <p>Bu link tek kullanımlıktır.</p>
    `,
  })
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/projects/[id]/submit/route.ts \
        app/api/projects/[id]/advisor-approve/route.ts \
        app/api/projects/[id]/members/route.ts \
        lib/email-service.ts
git commit -m "feat(projects): add submit, advisor-approve, and members endpoints"
```

---

## Chunk 3: Milestone & Escrow API

### File Map
- Create: `app/api/projects/[id]/milestones/route.ts`
- Create: `app/api/projects/[id]/milestones/[milestoneId]/evidence/route.ts`
- Create: `app/api/projects/[id]/milestones/[milestoneId]/request/route.ts`
- Create: `app/api/projects/[id]/donate/route.ts`

---

### Task 8: Milestone Endpoints

- [ ] **Step 1: Milestones list**

```typescript
// app/api/projects/[id]/milestones/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    const milestones = await db.collection('milestones')
      .find({ project_id: params.id })
      .sort({ order: 1 })
      .toArray()
    return NextResponse.json({ success: true, data: milestones })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 2: Evidence upload**

```typescript
// app/api/projects/[id]/milestones/[milestoneId]/evidence/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { milestoneEvidenceSchema } from '@/lib/validators/project'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string; milestoneId: string } }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const milestone = await db.collection('milestones').findOne({
      milestone_id: params.milestoneId,
      project_id: params.id,
    })
    if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    if (!['EvidenceRequired', 'UnlockRequested'].includes(milestone.status)) {
      return NextResponse.json({ error: 'Milestone is not accepting evidence' }, { status: 400 })
    }

    const body = await req.json()
    const validation = milestoneEvidenceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: validation.error.errors } }, { status: 400 })
    }

    await db.collection('milestones').updateOne(
      { milestone_id: params.milestoneId },
      { $set: {
          evidence_files: validation.data.evidence_files,
          evidence_note: validation.data.evidence_note,
          updated_at: new Date().toISOString(),
      }}
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 3: Unlock request**

```typescript
// app/api/projects/[id]/milestones/[milestoneId]/request/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: { id: string; milestoneId: string } }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const milestone = await db.collection('milestones').findOne({
      milestone_id: params.milestoneId,
      project_id: params.id,
    })
    if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    if (milestone.status !== 'EvidenceRequired') {
      return NextResponse.json({ error: 'Milestone must be in EvidenceRequired state' }, { status: 400 })
    }
    if (!milestone.evidence_files?.length) {
      return NextResponse.json({ error: 'Upload evidence before requesting unlock' }, { status: 400 })
    }

    await db.collection('milestones').updateOne(
      { milestone_id: params.milestoneId },
      { $set: { status: 'UnlockRequested', updated_at: new Date().toISOString() } }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/projects/[id]/milestones/route.ts \
        "app/api/projects/[id]/milestones/[milestoneId]/evidence/route.ts" \
        "app/api/projects/[id]/milestones/[milestoneId]/request/route.ts"
git commit -m "feat(projects): add milestone list, evidence upload, and unlock request"
```

---

### Task 9: Donate + Follow + ESG

**Files:**
- Create: `app/api/projects/[id]/donate/route.ts`
- Create: `app/api/projects/[id]/follow/route.ts`
- Create: `app/api/projects/[id]/esg/route.ts`

- [ ] **Step 1: Donate endpoint (soft-lock escrow)**

```typescript
// app/api/projects/[id]/donate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { z } from 'zod'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const donateSchema = z.object({
  amount: z.number().positive().min(10),
  currency: z.string().default('TRY'),
  iyzico_payment_id: z.string().min(1),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const body = await req.json()

    const validation = donateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: validation.error.errors } }, { status: 400 })
    }

    const { amount, currency, iyzico_payment_id } = validation.data
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.status !== 'Published') {
      return NextResponse.json({ error: 'Project is not accepting donations' }, { status: 400 })
    }

    // Upsert escrow record
    await db.collection('project_escrow').updateOne(
      { project_id: params.id },
      {
        $inc: { total_collected: amount },
        $set: { updated_at: new Date().toISOString() },
        $setOnInsert: {
          project_id: params.id,
          total_released: 0,
          pending_release: 0,
          created_at: new Date().toISOString(),
        },
      },
      { upsert: true }
    )

    // Record transaction
    await db.collection('escrow_transactions').insertOne({
      tx_id: `tx_${crypto.randomBytes(8).toString('hex')}`,
      project_id: params.id,
      donor_id: user.id,
      type: 'collect',
      amount,
      currency,
      iyzico_payment_id,
      status: 'completed',
      created_at: new Date().toISOString(),
    })

    // Spec §6: Only Milestone 1 is triggered automatically by the donation threshold.
    // Milestones 2 and 3 are unlocked by admin approval chain (milestone-approve endpoint sets next milestone to EvidenceRequired).
    const escrow = await db.collection('project_escrow').findOne({ project_id: params.id })
    const firstMilestone = await db.collection('milestones').findOne({
      project_id: params.id,
      order: 1,
      status: 'Locked',
    })

    if (firstMilestone && escrow && escrow.total_collected >= project.target_budget * 0.20) {
      await db.collection('milestones').updateOne(
        { milestone_id: firstMilestone.milestone_id },
        { $set: { status: 'EvidenceRequired', updated_at: new Date().toISOString() } }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 2: Follow toggle**

```typescript
// app/api/projects/[id]/follow/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const db = await getDb()

    const existing = await db.collection('sponsor_project_follows').findOne({
      donor_id: user.id,
      project_id: params.id,
    })

    if (existing) {
      await db.collection('sponsor_project_follows').deleteOne({ _id: existing._id })
      return NextResponse.json({ success: true, following: false })
    }

    await db.collection('sponsor_project_follows').insertOne({
      donor_id: user.id,
      project_id: params.id,
      followed_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, following: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 3: ESG metrics endpoint**

```typescript
// app/api/projects/[id]/esg/route.ts — per-donor aggregate
// app/api/projects/esg/route.ts — global donor ESG
// We create the global one (donor dashboard uses it)
```

Create `app/api/projects/esg/route.ts`:

```typescript
// app/api/projects/esg/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    const user = await requireUser()
    const db = await getDb()

    // Projects this donor donated to
    const donorTxs = await db.collection('escrow_transactions')
      .find({ donor_id: user.id, type: 'collect' })
      .toArray()

    const projectIds = [...new Set(donorTxs.map((t: any) => t.project_id))]
    const totalAmountDonated = donorTxs.reduce((sum: number, t: any) => sum + t.amount, 0)

    if (projectIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total_projects_supported: 0,
          total_students_reached: 0,
          completed_projects_ratio: 0,
          active_projects: 0,
          domain_breakdown: [],
          total_amount_donated: 0,
        },
      })
    }

    const projects = await db.collection('projects')
      .find({ project_id: { $in: projectIds } })
      .toArray()

    const completedCount = projects.filter((p: any) => p.status === 'Completed').length
    const activeCount = projects.filter((p: any) => p.status === 'Published').length

    const memberCounts = await db.collection('project_members')
      .aggregate([
        { $match: { project_id: { $in: projectIds } } },
        { $count: 'total' },
      ])
      .toArray()

    const domainCounts: Record<string, number> = {}
    projects.forEach((p: any) => {
      (p.domain || []).forEach((d: string) => {
        domainCounts[d] = (domainCounts[d] || 0) + 1
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        total_projects_supported: projectIds.length,
        total_students_reached: memberCounts[0]?.total || 0,
        completed_projects_ratio: projectIds.length > 0 ? completedCount / projectIds.length : 0,
        active_projects: activeCount,
        domain_breakdown: Object.entries(domainCounts).map(([domain, count]) => ({ domain, count })),
        total_amount_donated: totalAmountDonated,
      },
    })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/projects/[id]/donate/route.ts \
        app/api/projects/[id]/follow/route.ts \
        app/api/projects/esg/route.ts
git commit -m "feat(projects): add donate, follow, and ESG endpoints"
```

---

## Chunk 4: Admin API

### File Map
- Create: `app/api/admin/projects/route.ts`
- Create: `app/api/admin/projects/[id]/route.ts`
- Create: `app/api/admin/projects/[id]/verify/route.ts`
- Create: `app/api/admin/projects/[id]/reject/route.ts`
- Create: `app/api/admin/projects/[id]/milestone-approve/route.ts`
- Create: `app/api/admin/projects/[id]/suspend/route.ts`
- Create: `app/api/admin/projects/[id]/cancel/route.ts`
- Create: `app/api/admin/projects/[id]/risk/route.ts`

---

### Task 10: Admin Queue + Detail

- [ ] **Step 1: Admin queue**

```typescript
// app/api/admin/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'Pending'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))

    const db = await getDb()
    const [projects, total] = await Promise.all([
      db.collection('projects')
        .find({ status })
        .sort({ risk_score: 1, created_at: 1 }) // lowest risk score first = highest priority
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection('projects').countDocuments({ status }),
    ])

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 2: Admin detail**

```typescript
// app/api/admin/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['admin'])
    const db = await getDb()

    const [project, members, milestones, verification, escrow] = await Promise.all([
      db.collection('projects').findOne({ project_id: params.id }),
      db.collection('project_members').find({ project_id: params.id }).toArray(),
      db.collection('milestones').find({ project_id: params.id }).sort({ order: 1 }).toArray(),
      db.collection('project_verification').findOne({ project_id: params.id }),
      db.collection('project_escrow').findOne({ project_id: params.id }),
    ])

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: { ...project, members, milestones, verification, escrow } })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/projects/route.ts app/api/admin/projects/[id]/route.ts
git commit -m "feat(projects): add admin queue and detail endpoints"
```

---

### Task 11: Admin Actions

- [ ] **Step 1: Verify endpoint**

```typescript
// app/api/admin/projects/[id]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(['admin'])
    const db = await getDb()

    const project = await db.collection('projects').findOne({ project_id: params.id })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (project.status !== 'Pending') {
      return NextResponse.json({ error: 'Project must be Pending to verify' }, { status: 400 })
    }

    // Block if student project without advisor approval
    if (project.owner_type === 'student' && project.advisor_email && !project.advisor_approved_at) {
      return NextResponse.json({ error: 'Advisor approval required before verification' }, { status: 400 })
    }

    const now = new Date().toISOString()
    await Promise.all([
      db.collection('projects').updateOne(
        { project_id: params.id },
        { $set: { status: 'Published', published_at: now, updated_at: now } }
      ),
      db.collection('project_verification').updateOne(
        { project_id: params.id },
        { $set: { admin_reviewed_at: now, admin_reviewed_by: admin.id, school_doc_verified: true } }
      ),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 2: Reject endpoint**

```typescript
// app/api/admin/projects/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(['admin'])
    const body = await req.json()
    const { rejection_reason } = z.object({ rejection_reason: z.string().min(1) }).parse(body)

    const db = await getDb()
    const now = new Date().toISOString()

    await Promise.all([
      db.collection('projects').updateOne(
        { project_id: params.id },
        { $set: { status: 'Rejected', updated_at: now } }
      ),
      db.collection('project_verification').updateOne(
        { project_id: params.id },
        { $set: { admin_reviewed_at: now, admin_reviewed_by: admin.id, rejection_reason } }
      ),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 3: Milestone approve (payout trigger)**

```typescript
// app/api/admin/projects/[id]/milestone-approve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { adminMilestoneSchema } from '@/lib/validators/project'
import { calculateMilestoneRelease } from '@/lib/project-escrow'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(['admin'])
    const body = await req.json()
    const { action, admin_note, milestone_id } = {
      ...adminMilestoneSchema.parse(body),
      milestone_id: (body as any).milestone_id as string,
    }

    const db = await getDb()
    const now = new Date().toISOString()

    const milestone = await db.collection('milestones').findOne({
      milestone_id,
      project_id: params.id,
      status: 'UnlockRequested',
    })
    if (!milestone) return NextResponse.json({ error: 'Milestone not found or not in UnlockRequested state' }, { status: 404 })

    if (action === 'reject') {
      await db.collection('milestones').updateOne(
        { milestone_id },
        { $set: { status: 'EvidenceRequired', admin_note, updated_at: now } }
      )
      return NextResponse.json({ success: true, action: 'rejected' })
    }

    // Approve: calculate payout amount
    const escrow = await db.collection('project_escrow').findOne({ project_id: params.id })
    if (!escrow) return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })

    const payoutAmount = calculateMilestoneRelease(escrow.total_collected, milestone.percentage)

    // Two-step: set Approved first (admin decision recorded), then Paid (payout queued).
    // In soft-lock MVP, we move directly to Paid after queuing the Iyzico payout.
    await db.collection('milestones').updateOne(
      { milestone_id },
      { $set: { status: 'Approved', admin_note, approved_at: now, approved_by: admin.id, updated_at: now } }
    )

    // Record payout transaction then mark as Paid
    // (In production, Iyzico webhook would set Paid; in soft-lock MVP we set it immediately)

    // Now mark as Paid
    await db.collection('milestones').updateOne(
      { milestone_id },
      { $set: { status: 'Paid', updated_at: now } }
    )

    // Update escrow
    await db.collection('project_escrow').updateOne(
      { project_id: params.id },
      {
        $inc: { total_released: payoutAmount, total_collected: -payoutAmount },
        $set: { updated_at: now },
      }
    )

    // Record release transaction
    await db.collection('escrow_transactions').insertOne({
      tx_id: `tx_${crypto.randomBytes(8).toString('hex')}`,
      project_id: params.id,
      milestone_id,
      type: 'release',
      amount: payoutAmount,
      currency: 'TRY',
      status: 'pending_iyzico', // Iyzico payout initiated externally
      created_at: now,
    })

    // Unlock next milestone if exists
    const nextMilestone = await db.collection('milestones').findOne({
      project_id: params.id,
      order: milestone.order + 1,
      status: 'Locked',
    })
    if (nextMilestone) {
      await db.collection('milestones').updateOne(
        { milestone_id: nextMilestone.milestone_id },
        { $set: { status: 'EvidenceRequired', updated_at: now } }
      )
    } else {
      // All milestones paid — complete project
      const allMilestones = await db.collection('milestones')
        .find({ project_id: params.id })
        .toArray()
      const allPaid = allMilestones.every((m: any) => m.milestone_id === milestone_id || m.status === 'Paid')
      if (allPaid) {
        await db.collection('projects').updateOne(
          { project_id: params.id },
          { $set: { status: 'Completed', updated_at: now } }
        )
      }
    }

    return NextResponse.json({ success: true, action: 'approved', payout_amount: payoutAmount })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 4: Suspend + Cancel (refund) + Risk**

```typescript
// app/api/admin/projects/[id]/suspend/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['admin'])
    const db = await getDb()
    await db.collection('projects').updateOne(
      { project_id: params.id },
      { $set: { status: 'Suspended', updated_at: new Date().toISOString() } }
    )
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

```typescript
// app/api/admin/projects/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { calculateRefundPerDonor } from '@/lib/project-escrow'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['admin'])
    const db = await getDb()
    const now = new Date().toISOString()

    const escrow = await db.collection('project_escrow').findOne({ project_id: params.id })

    if (escrow && escrow.total_collected > 0) {
      // Fetch all collect transactions to calculate per-donor refunds
      const collectTxs = await db.collection('escrow_transactions')
        .find({ project_id: params.id, type: 'collect' })
        .toArray()

      const refundTxs = collectTxs.map((tx: any) => ({
        tx_id: `tx_${crypto.randomBytes(8).toString('hex')}`,
        project_id: params.id,
        type: 'refund',
        donor_id: tx.donor_id,
        original_tx_id: tx.tx_id,
        amount: calculateRefundPerDonor(tx.amount, escrow.total_collected, escrow.total_released),
        currency: tx.currency || 'TRY',
        status: 'pending_iyzico',
        created_at: now,
      }))

      if (refundTxs.length > 0) {
        await db.collection('escrow_transactions').insertMany(refundTxs)
      }
    }

    await db.collection('projects').updateOne(
      { project_id: params.id },
      { $set: { status: 'Rejected', updated_at: now } }
    )

    return NextResponse.json({ success: true, refunds_queued: escrow ? true : false })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

```typescript
// app/api/admin/projects/[id]/risk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireRole } from '@/lib/authz'
import { errorResponse, getStatusCode } from '@/lib/api-error'
import { calculateRiskScore, getRiskLevel } from '@/lib/project-risk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['admin'])
    const db = await getDb()

    const [project, verification, members] = await Promise.all([
      db.collection('projects').findOne({ project_id: params.id }),
      db.collection('project_verification').findOne({ project_id: params.id }),
      db.collection('project_members').find({ project_id: params.id }).toArray(),
    ])

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const accountCreated = await db.collection('users')
      .findOne({ _id: project.owner_id }, { projection: { createdAt: 1 } })
    const accountAgeDays = accountCreated?.createdAt
      ? Math.floor((Date.now() - new Date(accountCreated.createdAt).getTime()) / 86400000)
      : 0

    const score = calculateRiskScore(
      { files: project.files, budget_items: project.budget_items, members, timeline: project.timeline, video_url: project.video_url, account_age_days: accountAgeDays },
      { advisor_approved: verification?.advisor_approved || false, student_email_verified: verification?.student_email_verified || false, school_doc_verified: verification?.school_doc_verified || false }
    )

    return NextResponse.json({
      success: true,
      data: {
        score,
        level: getRiskLevel(score),
        breakdown: {
          advisor_approved: verification?.advisor_approved || false,
          student_email_verified: verification?.student_email_verified || false,
          school_doc_verified: verification?.school_doc_verified || false,
          has_files: project.files?.length >= 1,
          has_detailed_budget: project.budget_items?.length >= 3,
          has_multiple_members: members.length > 1,
          has_timeline: project.timeline?.length >= 3,
          has_video: !!project.video_url,
          account_age_days: accountAgeDays,
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json(errorResponse(error), { status: getStatusCode(error) })
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/projects/[id]/verify/route.ts \
        app/api/admin/projects/[id]/reject/route.ts \
        "app/api/admin/projects/[id]/milestone-approve/route.ts" \
        app/api/admin/projects/[id]/suspend/route.ts \
        app/api/admin/projects/[id]/cancel/route.ts \
        app/api/admin/projects/[id]/risk/route.ts
git commit -m "feat(projects): add admin verify, reject, milestone-approve, suspend, cancel, risk endpoints"
```

---

## Chunk 5: Frontend

### File Map
- Create: `app/[locale]/projects/page.tsx` — Browse projects
- Create: `app/[locale]/projects/create/page.tsx` — 4-step wizard
- Create: `app/[locale]/projects/[id]/page.tsx` — Project detail
- Create: `app/[locale]/projects/[id]/milestones/page.tsx` — Milestone management
- Create: `components/project/ProjectCard.tsx`
- Create: `components/project/ProjectFilters.tsx`
- Create: `components/project/ProjectWizard.tsx`
- Create: `components/project/MilestoneTracker.tsx`
- Create: `components/project/RiskScoreBadge.tsx`
- Modify: `app/[locale]/admin/page.tsx` (or admin layout) — add Projects tab
- Modify: `app/[locale]/dashboard/page.tsx` (or donor dashboard) — add ESG tab

---

### Task 12: ProjectCard + ProjectFilters Components

- [ ] **Step 1: Create ProjectCard**

```typescript
// components/project/ProjectCard.tsx
'use client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Project } from '@/types/projects'

const TYPE_LABELS: Record<string, string> = {
  club: 'Kulüp', team: 'Ekip', research: 'Araştırma',
  competition: 'Yarışma', social: 'Sosyal', event: 'Etkinlik', conference: 'Konferans',
}

interface Props {
  project: Project & { escrow?: { total_collected: number } }
}

export function ProjectCard({ project }: Props) {
  const raised = project.escrow?.total_collected ?? 0
  const progress = Math.min(100, Math.round((raised / project.target_budget) * 100))

  return (
    <Link href={`/projects/${project.project_id}`} className="block group">
      <div className="border rounded-xl p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="secondary">{TYPE_LABELS[project.type] ?? project.type}</Badge>
          <span className="text-xs text-muted-foreground">{project.school_level === 'high_school' ? 'Lise' : 'Üniversite'}</span>
        </div>

        <h3 className="font-semibold text-base mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-1">{project.school_name}</p>

        {project.domain?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.domain.slice(0, 3).map(d => (
              <span key={d} className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {d}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{raised.toLocaleString('tr-TR')} ₺ toplandı</span>
            <span>Hedef: {project.target_budget.toLocaleString('tr-TR')} ₺</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create ProjectFilters**

```typescript
// components/project/ProjectFilters.tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const DOMAINS = ['mühendislik', 'sağlık', 'yapay zeka', 'sürdürülebilirlik', 'sosyal etki', 'biyoteknoloji']
const TYPES = [
  { value: 'club', label: 'Kulüp' }, { value: 'team', label: 'Ekip' },
  { value: 'research', label: 'Araştırma' }, { value: 'competition', label: 'Yarışma' },
  { value: 'social', label: 'Sosyal' }, { value: 'event', label: 'Etkinlik' },
]

export function ProjectFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || !value) params.delete(key)
    else params.set(key, value)
    params.set('page', '1')
    router.push(`/projects?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Input
        placeholder="Proje ara..."
        className="w-48"
        defaultValue={searchParams.get('search') || ''}
        onChange={e => update('search', e.target.value)}
      />
      <Select onValueChange={v => update('type', v)} defaultValue={searchParams.get('type') || 'all'}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Tip" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Tipler</SelectItem>
          {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select onValueChange={v => update('domain', v)} defaultValue={searchParams.get('domain') || 'all'}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Alan" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Alanlar</SelectItem>
          {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select onValueChange={v => update('school_level', v)} defaultValue={searchParams.get('school_level') || 'all'}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Seviye" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tümü</SelectItem>
          <SelectItem value="high_school">Lise</SelectItem>
          <SelectItem value="university">Üniversite</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/project/ProjectCard.tsx components/project/ProjectFilters.tsx
git commit -m "feat(projects): add ProjectCard and ProjectFilters components"
```

---

### Task 13: Browse + Detail Pages

- [ ] **Step 1: Browse page**

```typescript
// app/[locale]/projects/page.tsx
import { ProjectCard } from '@/components/project/ProjectCard'
import { ProjectFilters } from '@/components/project/ProjectFilters'
import { Suspense } from 'react'

async function ProjectsList({ searchParams }: { searchParams: Record<string, string> }) {
  const params = new URLSearchParams(searchParams).toString()
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/projects?${params}`, { cache: 'no-store' })
  const { data, pagination } = await res.json()

  if (!data?.length) {
    return <p className="text-muted-foreground text-center py-12">Proje bulunamadı.</p>
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((project: any) => <ProjectCard key={project.project_id} project={project} />)}
      </div>
      <p className="text-sm text-muted-foreground text-center mt-6">
        {pagination.total} projeden {data.length} tanesi gösteriliyor
      </p>
    </>
  )
}

export default function ProjectsBrowsePage({ searchParams }: { searchParams: Record<string, string> }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projeler</h1>
          <p className="text-muted-foreground text-sm">Doğrulanmış öğrenci ekiplerine destek ol</p>
        </div>
        <a href="/projects/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Proje Başvurusu
        </a>
      </div>
      <Suspense fallback={null}>
        <ProjectFilters />
      </Suspense>
      <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-xl" />}>
        <ProjectsList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
```

- [ ] **Step 2: Project detail page**

```typescript
// app/[locale]/projects/[id]/page.tsx
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MilestoneTracker } from '@/components/project/MilestoneTracker'

async function getProject(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/projects/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  const { data } = await res.json()
  return data
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)
  if (!project) notFound()

  const raised = project.escrow?.total_collected ?? 0
  const progress = Math.min(100, Math.round((raised / project.target_budget) * 100))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge>{project.type}</Badge>
        <Badge variant="outline">{project.school_level === 'high_school' ? 'Lise' : 'Üniversite'}</Badge>
        {project.domain?.map((d: string) => <Badge key={d} variant="secondary">{d}</Badge>)}
      </div>

      <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
      <p className="text-muted-foreground mb-1">{project.school_name}</p>
      {project.club_name && <p className="text-sm text-muted-foreground mb-4">{project.club_name}</p>}

      <div className="bg-muted/40 rounded-xl p-5 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{raised.toLocaleString('tr-TR')} ₺ toplandı</span>
          <span className="text-muted-foreground">Hedef: {project.target_budget.toLocaleString('tr-TR')} ₺</span>
        </div>
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">%{progress} tamamlandı</p>
      </div>

      <div className="prose dark:prose-invert max-w-none mb-8">
        <h2 className="text-lg font-semibold mb-2">Proje Hakkında</h2>
        <p>{project.description}</p>
      </div>

      {project.milestones?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Milestone Takibi</h2>
          <MilestoneTracker milestones={project.milestones} />
        </div>
      )}

      {project.members?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Ekip</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {project.members.map((m: any) => (
              <div key={m.member_id} className="border rounded-lg p-3 text-sm">
                <p className="font-medium">{m.name}</p>
                <p className="text-muted-foreground text-xs">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: MilestoneTracker component**

```typescript
// components/project/MilestoneTracker.tsx
import type { Milestone } from '@/types/projects'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  Locked:           { label: 'Kilitli', color: 'text-gray-400' },
  EvidenceRequired: { label: 'Kanıt Bekleniyor', color: 'text-yellow-600' },
  UnlockRequested:  { label: 'Admin Onayında', color: 'text-blue-600' },
  Approved:         { label: 'Onaylandı', color: 'text-green-600' },
  Paid:             { label: 'Ödendi', color: 'text-green-700 font-semibold' },
}

export function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="space-y-3">
      {milestones.map((ms, i) => {
        const statusInfo = STATUS_LABELS[ms.status] ?? { label: ms.status, color: '' }
        return (
          <div key={ms.milestone_id} className="flex items-center gap-4 border rounded-lg p-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{ms.title}</p>
              <p className="text-xs text-muted-foreground">%{ms.percentage} · {ms.description}</p>
            </div>
            <span className={`text-xs flex-shrink-0 ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/projects/page.tsx" \
        "app/[locale]/projects/[id]/page.tsx" \
        components/project/MilestoneTracker.tsx
git commit -m "feat(projects): add browse, detail pages and MilestoneTracker"
```

---

### Task 14: Project Create Wizard

- [ ] **Step 1: Create wizard page**

```typescript
// app/[locale]/projects/create/page.tsx
import { ProjectWizard } from '@/components/project/ProjectWizard'

export default function CreateProjectPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Proje Başvurusu</h1>
      <p className="text-muted-foreground text-sm mb-8">4 adımda başvurunuzu tamamlayın</p>
      <ProjectWizard />
    </div>
  )
}
```

- [ ] **Step 2: Create ProjectWizard component**

```typescript
// components/project/ProjectWizard.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectCreateSchema } from '@/lib/validators/project'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { z } from 'zod'

type FormData = z.infer<typeof projectCreateSchema>

const STEPS = ['Temel Bilgiler', 'Ekip & Okul', 'Bütçe & Çıktı', 'Dosyalar & Gönder']

export function ProjectWizard() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: {
      files: [],
      domain: [],
      expected_outputs: [''],
      timeline: [{ week: 1, task: '' }],
      budget_items: [{ name: '', amount: 0, category: '' }],
    },
  })

  const saveAsDraft = async (data: Partial<FormData>) => {
    if (savedId) {
      await fetch(`/api/projects/${savedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form.getValues(), ...data }),
      })
      const json = await res.json()
      if (json.data?.project_id) setSavedId(json.data.project_id)
    }
  }

  const handleSubmit = async () => {
    if (!savedId) return
    setLoading(true)
    try {
      await fetch(`/api/projects/${savedId}/submit`, { method: 'POST' })
      router.push(`/projects/${savedId}?submitted=1`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Step indicators */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-muted'}`} />
        ))}
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-6">Adım {step + 1} / {STEPS.length} — {STEPS[step]}</p>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Proje Adı</label>
            <Input {...form.register('title')} placeholder="Projenizin adı" />
            {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Açıklama</label>
            <Textarea {...form.register('description')} placeholder="Projenizi detaylıca açıklayın" rows={5} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Proje Tipi</label>
            <Select onValueChange={v => form.setValue('type', v as any)}>
              <SelectTrigger><SelectValue placeholder="Tip seçin" /></SelectTrigger>
              <SelectContent>
                {['club','team','research','competition','social','event','conference'].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tanıtım Videosu (isteğe bağlı)</label>
            <Input {...form.register('video_url')} placeholder="https://youtube.com/..." />
          </div>
        </div>
      )}

      {/* Step 1: Team & School */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Okul Adı</label>
              <Input {...form.register('school_name')} placeholder="İstanbul Teknik Üniversitesi" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Okul Email</label>
              <Input {...form.register('school_email')} placeholder="proje@itu.edu.tr" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Okul Seviyesi</label>
              <Select onValueChange={v => form.setValue('school_level', v as any)}>
                <SelectTrigger><SelectValue placeholder="Seviye" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">Lise</SelectItem>
                  <SelectItem value="university">Üniversite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Kulüp / Topluluk Adı</label>
              <Input {...form.register('club_name')} placeholder="IEEE Öğrenci Topluluğu" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Danışman Adı</label>
              <Input {...form.register('advisor_name')} placeholder="Prof. Dr. Adı Soyadı" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Danışman Email</label>
              <Input {...form.register('advisor_email')} placeholder="hoca@uni.edu.tr" />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Budget & Output */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Hedef Bütçe (₺)</label>
            <Input type="number" {...form.register('target_budget', { valueAsNumber: true })} placeholder="50000" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Bütçe Kalemleri</label>
            {form.watch('budget_items').map((_: any, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input {...form.register(`budget_items.${i}.name`)} placeholder="Kalem adı" className="flex-1" />
                <Input type="number" {...form.register(`budget_items.${i}.amount`, { valueAsNumber: true })} placeholder="Tutar" className="w-28" />
                <Input {...form.register(`budget_items.${i}.category`)} placeholder="Kategori" className="w-28" />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const items = form.getValues('budget_items')
              form.setValue('budget_items', [...items, { name: '', amount: 0, category: '' }])
            }}>+ Kalem Ekle</Button>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Beklenen Çıktılar</label>
            <Textarea
              placeholder="Her satıra bir çıktı yazın"
              onChange={e => form.setValue('expected_outputs', e.target.value.split('\n').filter(Boolean))}
            />
          </div>
        </div>
      )}

      {/* Step 3: Files & Submit */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Belgeler</label>
            <p className="text-xs text-muted-foreground mb-2">Cloudinary URL'lerini girin (proje belgesi, okul yazısı vb.)</p>
            <Textarea
              placeholder="https://res.cloudinary.com/..."
              onChange={e => form.setValue('files', e.target.value.split('\n').filter(Boolean))}
              rows={4}
            />
          </div>
          <div className="bg-muted/40 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium">Gönderim öncesi kontrol:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>✓ Proje adı ve açıklaması dolduruldu</li>
              <li>✓ Danışman email adresi girildi (onay emaili gönderilecek)</li>
              <li>✓ Bütçe kalemleri eklendi</li>
              <li>✓ En az 1 belge yüklendi</li>
            </ul>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          Geri
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={async () => {
            await saveAsDraft(form.getValues())
            setStep(s => s + 1)
          }}>
            Kaydet & Devam
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
          </Button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/projects/create/page.tsx" components/project/ProjectWizard.tsx
git commit -m "feat(projects): add project creation wizard"
```

---

### Task 15: Milestone Management Page (Team View)

**Files:**
- Create: `app/[locale]/projects/[id]/milestones/page.tsx`

- [ ] **Step 1: Create milestone management page**

```typescript
// app/[locale]/projects/[id]/milestones/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { MilestoneManagementPanel } from '@/components/project/MilestoneManagementPanel'

export default async function MilestoneManagementPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Milestone Yönetimi</h1>
      <p className="text-muted-foreground text-sm mb-6">Kanıt yükleyin ve ödeme kilit açma talepleri gönderin</p>
      <MilestoneManagementPanel projectId={params.id} />
    </div>
  )
}
```

- [ ] **Step 2: Create MilestoneManagementPanel**

```typescript
// components/project/MilestoneManagementPanel.tsx
'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import type { Milestone } from '@/types/projects'

export function MilestoneManagementPanel({ projectId }: { projectId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [evidenceForms, setEvidenceForms] = useState<Record<string, { files: string; note: string }>>({})

  useEffect(() => {
    fetch(`/api/projects/${projectId}/milestones`)
      .then(r => r.json())
      .then(j => { setMilestones(j.data || []); setLoading(false) })
  }, [projectId])

  const uploadEvidence = async (milestoneId: string) => {
    const form = evidenceForms[milestoneId]
    if (!form?.files || !form?.note) return alert('Dosya URL ve not gerekli')
    setSubmitting(milestoneId)
    await fetch(`/api/projects/${projectId}/milestones/${milestoneId}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evidence_files: form.files.split('\n').filter(Boolean),
        evidence_note: form.note,
      }),
    })
    setSubmitting(null)
    alert('Kanıt yüklendi')
  }

  const requestUnlock = async (milestoneId: string) => {
    setSubmitting(milestoneId)
    await fetch(`/api/projects/${projectId}/milestones/${milestoneId}/request`, { method: 'POST' })
    setSubmitting(null)
    const updated = await fetch(`/api/projects/${projectId}/milestones`).then(r => r.json())
    setMilestones(updated.data || [])
  }

  if (loading) return <div className="h-32 animate-pulse bg-muted rounded-xl" />

  return (
    <div className="space-y-4">
      {milestones.map(ms => (
        <div key={ms.milestone_id} className="border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold">{ms.title}</p>
              <p className="text-xs text-muted-foreground">%{ms.percentage} · {ms.status}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${ms.status === 'Paid' ? 'bg-green-100 text-green-700' : ms.status === 'Locked' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
              {ms.status}
            </span>
          </div>

          {ms.status === 'EvidenceRequired' && (
            <div className="space-y-2 mt-3">
              <Input
                placeholder="Cloudinary dosya URL'leri (her satıra bir tane)"
                value={evidenceForms[ms.milestone_id]?.files || ''}
                onChange={e => setEvidenceForms(f => ({ ...f, [ms.milestone_id]: { ...f[ms.milestone_id], files: e.target.value } }))}
              />
              <Textarea
                placeholder="Kanıt açıklaması (ne yaptınız, sonuçlar...)"
                rows={3}
                value={evidenceForms[ms.milestone_id]?.note || ''}
                onChange={e => setEvidenceForms(f => ({ ...f, [ms.milestone_id]: { ...f[ms.milestone_id], note: e.target.value } }))}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => uploadEvidence(ms.milestone_id)} disabled={submitting === ms.milestone_id}>
                  Kanıt Yükle
                </Button>
                {ms.evidence_files?.length > 0 && (
                  <Button size="sm" onClick={() => requestUnlock(ms.milestone_id)} disabled={submitting === ms.milestone_id}>
                    Ödeme Talebinde Bulun
                  </Button>
                )}
              </div>
            </div>
          )}

          {ms.status === 'UnlockRequested' && (
            <p className="text-sm text-blue-600 mt-2">Admin inceliyor, ödeme onayı bekleniyor.</p>
          )}

          {ms.admin_note && (
            <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">Admin notu: {ms.admin_note}</p>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/projects/[id]/milestones/page.tsx" \
        components/project/MilestoneManagementPanel.tsx
git commit -m "feat(projects): add milestone management page for teams"
```

---

### Task 16: Admin Projects Tab

- [ ] **Step 1: Find the admin page and add Projects tab**

Check `app/[locale]/admin/page.tsx` or `app/[locale]/(dashboard)/admin/page.tsx` for the existing tab structure. Add a "Projeler" tab following the same Tabs pattern already in use.

```typescript
// In the admin page, add inside the Tabs component:
<TabsTrigger value="projects">Projeler</TabsTrigger>

// And the content panel:
<TabsContent value="projects">
  <AdminProjectsPanel />
</TabsContent>
```

- [ ] **Step 2: Create AdminProjectsPanel component**

```typescript
// components/project/AdminProjectsPanel.tsx
'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RiskScoreBadge } from './RiskScoreBadge'

export function AdminProjectsPanel() {
  const [projects, setProjects] = useState<any[]>([])
  const [status, setStatus] = useState('Pending')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/projects?status=${status}`)
    const json = await res.json()
    setProjects(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  const handleVerify = async (id: string) => {
    await fetch(`/api/admin/projects/${id}/verify`, { method: 'POST' })
    load()
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Red sebebi:')
    if (!reason) return
    await fetch(`/api/admin/projects/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejection_reason: reason }),
    })
    load()
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['Pending', 'Published', 'Rejected', 'Suspended'].map(s => (
          <Button key={s} variant={status === s ? 'default' : 'outline'} size="sm" onClick={() => setStatus(s)}>
            {s}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="h-32 animate-pulse bg-muted rounded-xl" />
      ) : projects.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">Bu durumda proje yok.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p: any) => (
            <div key={p.project_id} className="border rounded-lg p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <RiskScoreBadge score={p.risk_score} />
                </div>
                <p className="text-xs text-muted-foreground">{p.school_name} · {p.type}</p>
              </div>
              {status === 'Pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" onClick={() => handleVerify(p.project_id)}>Onayla</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(p.project_id)}>Reddet</Button>
                </div>
              )}
              {status === 'Published' && (
                <Button size="sm" variant="outline" onClick={() => window.open(`/projects/${p.project_id}`)}>Görüntüle</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create RiskScoreBadge**

```typescript
// components/project/RiskScoreBadge.tsx
import { getRiskLevel } from '@/lib/project-risk'

export function RiskScoreBadge({ score }: { score: number }) {
  const level = getRiskLevel(score)
  const colors = {
    high:   'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    normal: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[level]}`}>
      Risk: {score}
    </span>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/project/AdminProjectsPanel.tsx components/project/RiskScoreBadge.tsx
git commit -m "feat(projects): add admin projects panel and risk score badge"
```

---

### Task 16: ESG Panel in Donor Dashboard

- [ ] **Step 1: Find donor dashboard and add Impact tab**

Locate the donor dashboard (likely `app/[locale]/dashboard/page.tsx` or similar). Add an "Etki" tab following the existing Tabs pattern.

```typescript
<TabsTrigger value="impact">Etki</TabsTrigger>

<TabsContent value="impact">
  <ESGImpactPanel />
</TabsContent>
```

- [ ] **Step 2: Create ESGImpactPanel**

```typescript
// components/project/ESGImpactPanel.tsx
'use client'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { ESGMetrics } from '@/types/projects'

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0891b2']

export function ESGImpactPanel() {
  const [metrics, setMetrics] = useState<ESGMetrics | null>(null)

  useEffect(() => {
    fetch('/api/projects/esg').then(r => r.json()).then(j => setMetrics(j.data))
  }, [])

  if (!metrics) return <div className="h-48 animate-pulse bg-muted rounded-xl" />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Desteklenen Proje', value: metrics.total_projects_supported },
          { label: 'Ulaşılan Öğrenci', value: metrics.total_students_reached },
          { label: 'Aktif Proje', value: metrics.active_projects },
          { label: 'Toplam Destek (₺)', value: metrics.total_amount_donated.toLocaleString('tr-TR') },
        ].map(stat => (
          <div key={stat.label} className="border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {metrics.domain_breakdown.length > 0 && (
        <div>
          <h3 className="font-medium mb-3 text-sm">Alan Dağılımı</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={metrics.domain_breakdown} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={70}>
                  {metrics.domain_breakdown.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {metrics.domain_breakdown.map((d: any, i: number) => (
                <div key={d.domain} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span>{d.domain}</span>
                  <span className="text-muted-foreground ml-auto">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-muted rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.round(metrics.completed_projects_ratio * 100)}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          %{Math.round(metrics.completed_projects_ratio * 100)} tamamlanma
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/project/ESGImpactPanel.tsx
git commit -m "feat(projects): add ESG impact panel for donor dashboard"
```

---

### Task 17: MongoDB Indexes

- [ ] **Step 1: Create index setup script**

```typescript
// scripts/create-project-indexes.ts
import { getDb } from '../lib/db'

async function createIndexes() {
  const db = await getDb()

  await db.collection('projects').createIndexes([
    { key: { project_id: 1 }, unique: true },
    { key: { owner_id: 1 } },
    { key: { status: 1, risk_score: 1 } },
    { key: { status: 1, published_at: -1 } },
    { key: { type: 1, status: 1 } },
    { key: { domain: 1 } },
    { key: { title: 'text', description: 'text' } },
  ])

  await db.collection('milestones').createIndexes([
    { key: { milestone_id: 1 }, unique: true },
    { key: { project_id: 1, order: 1 } },
    { key: { project_id: 1, status: 1 } },
  ])

  await db.collection('project_escrow').createIndexes([
    { key: { project_id: 1 }, unique: true },
  ])

  await db.collection('escrow_transactions').createIndexes([
    { key: { tx_id: 1 }, unique: true },
    { key: { project_id: 1, type: 1 } },
    { key: { donor_id: 1, type: 1 } },
  ])

  await db.collection('sponsor_project_follows').createIndexes([
    { key: { donor_id: 1, project_id: 1 }, unique: true },
    { key: { donor_id: 1 } },
  ])

  await db.collection('project_verification').createIndexes([
    { key: { project_id: 1 }, unique: true },
  ])

  console.log('✓ Project indexes created')
  process.exit(0)
}

createIndexes().catch(console.error)
```

- [ ] **Step 2: Run the script once**

```bash
npx tsx scripts/create-project-indexes.ts
```
Expected: `✓ Project indexes created`

- [ ] **Step 3: Commit**

```bash
git add scripts/create-project-indexes.ts
git commit -m "feat(projects): add MongoDB indexes for projects collections"
```

---

### Task 18: End-to-End Smoke Test

- [ ] **Step 1: Start dev server**
```bash
npm run dev
```

- [ ] **Step 2: Test project creation flow**
  1. Log in as a student user at `http://localhost:3000`
  2. Navigate to `/projects/create`
  3. Complete all 4 wizard steps
  4. Click "Başvuruyu Gönder"
  5. Verify redirect to `/projects/{id}?submitted=1`
  6. Check MongoDB `projects` collection: status should be `Pending`

- [ ] **Step 3: Test advisor approval**
  1. Check email (Resend dev log) for advisor approval link
  2. Visit the link: `/api/projects/{id}/advisor-approve?token={token}`
  3. Verify `advisor_approved_at` is set in MongoDB

- [ ] **Step 4: Test admin flow**
  1. Log in as admin
  2. Navigate to `/admin` → "Projeler" tab
  3. Verify project appears in Pending queue with risk score
  4. Click "Onayla"
  5. Verify project status changes to `Published`

- [ ] **Step 5: Test browse + donate**
  1. Navigate to `/projects`
  2. Verify published project appears with filters working
  3. Click project → detail page visible
  4. Verify milestone tracker shows 3 milestones in Locked state

- [ ] **Step 6: Test ESG panel**
  1. Log in as donor
  2. Navigate to dashboard → "Etki" tab
  3. Verify ESGImpactPanel renders (may show zeros if no donations yet)

- [ ] **Step 7: Commit final**

```bash
git add -A
git commit -m "feat(projects): complete FundEd Projects module"
```
