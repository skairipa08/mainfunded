import type { Milestone } from '@/types/projects'

const STATUS_LABELS: Record<string, string> = {
  Locked: 'Kilitli',
  EvidenceRequired: 'Kanıt Bekleniyor',
  UnlockRequested: 'Onay Bekleniyor',
  Approved: 'Onaylandı',
  Paid: 'Ödendi',
}

const STATUS_COLORS: Record<string, string> = {
  Locked: 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  EvidenceRequired: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  UnlockRequested: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Approved: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

const STEP_INDICATORS: Record<string, string> = {
  Locked: '🔒',
  EvidenceRequired: '📋',
  UnlockRequested: '⏳',
  Approved: '✅',
  Paid: '💰',
}

interface Props {
  milestones: Milestone[]
}

export function MilestoneTracker({ milestones }: Props) {
  const sorted = [...milestones].sort((a, b) => a.order - b.order)
  const paidCount = sorted.filter(m => m.status === 'Paid').length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dönüm Noktaları
        </h3>
        <span className="text-xs text-muted-foreground">{paidCount}/{sorted.length} tamamlandı</span>
      </div>

      {sorted.map((milestone, idx) => (
        <div
          key={milestone.milestone_id}
          className="flex items-start gap-3 p-3 rounded-lg border bg-card"
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
            {idx + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium truncate">{milestone.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[milestone.status]}`}>
                {STEP_INDICATORS[milestone.status]} {STATUS_LABELS[milestone.status]}
              </span>
            </div>
            {milestone.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{milestone.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>%{milestone.percentage} ödeme</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
