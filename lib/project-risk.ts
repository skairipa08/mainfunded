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
