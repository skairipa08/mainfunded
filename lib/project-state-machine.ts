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
