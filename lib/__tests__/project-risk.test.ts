import { describe, it, expect } from 'vitest'
import { calculateRiskScore, getRiskLevel } from '../project-risk'

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

describe('getRiskLevel', () => {
  it('returns high for score < 40', () => {
    expect(getRiskLevel(0)).toBe('high')
    expect(getRiskLevel(39)).toBe('high')
  })

  it('returns medium for score 40-59', () => {
    expect(getRiskLevel(40)).toBe('medium')
    expect(getRiskLevel(59)).toBe('medium')
  })

  it('returns normal for score >= 60', () => {
    expect(getRiskLevel(60)).toBe('normal')
    expect(getRiskLevel(100)).toBe('normal')
  })
})
