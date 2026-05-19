'use client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Project } from '@/types/projects'

const TYPE_LABELS: Record<string, string> = {
  club: 'Kulüp',
  team: 'Ekip',
  research: 'Araştırma',
  competition: 'Yarışma',
  social: 'Sosyal',
  event: 'Etkinlik',
  conference: 'Konferans',
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
          <span className="text-xs text-muted-foreground">
            {project.school_level === 'high_school' ? 'Lise' : 'Üniversite'}
          </span>
        </div>

        <h3 className="font-semibold text-base mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-1">{project.school_name}</p>

        {project.domain?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.domain.slice(0, 3).map(d => (
              <span
                key={d}
                className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full"
              >
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
