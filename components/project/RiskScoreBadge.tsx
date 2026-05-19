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
