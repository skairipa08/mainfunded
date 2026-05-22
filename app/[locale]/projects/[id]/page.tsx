'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { MilestoneTracker } from '@/components/project/MilestoneTracker'
import type { Project, Milestone, ProjectMember } from '@/types/projects'

const TYPE_LABELS: Record<string, string> = {
  club: 'Kulüp',
  team: 'Ekip',
  research: 'Araştırma',
  competition: 'Yarışma',
  social: 'Sosyal',
  event: 'Etkinlik',
  conference: 'Konferans',
}

interface ProjectDetail extends Project {
  escrow?: { total_collected: number; total_released: number }
  milestones?: Milestone[]
  members?: ProjectMember[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => {
        if (r.status === 404) { setMissing(true); return null }
        return r.json()
      })
      .then(json => {
        if (json?.success) setProject(json.data)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (missing) notFound()

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
          <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
              </div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!project) return null

  const raised = project.escrow?.total_collected ?? 0
  const progress = Math.min(100, Math.round((raised / project.target_budget) * 100))

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="mb-2">
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
              ← Projelere dön
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary">{TYPE_LABELS[project.type] ?? project.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {project.school_level === 'high_school' ? 'Lise' : 'Üniversite'}
                  </span>
                  {project.domain?.slice(0, 3).map(d => (
                    <span key={d} className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {d}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <p className="text-muted-foreground text-sm mt-1">{project.school_name} · {project.city}</p>
              </div>

              {project.description && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>{project.description}</p>
                </div>
              )}

              {project.members && project.members.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Ekip</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.members.map(m => (
                      <div key={m.member_id} className="text-sm px-3 py-1 rounded-full bg-muted">
                        {m.name}
                        <span className="text-xs text-muted-foreground ml-1">({m.role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {project.milestones && project.milestones.length > 0 && (
                <MilestoneTracker milestones={project.milestones} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="border rounded-xl p-5 bg-white dark:bg-gray-900 sticky top-20">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{raised.toLocaleString('tr-TR')} ₺</span>
                    <span className="text-muted-foreground">/ {project.target_budget.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <Progress value={progress} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">%{progress} tamamlandı</p>
                </div>

                {project.status === 'Published' ? (
                  <Button className="w-full" asChild>
                    <Link href={`/donate?project_id=${project.project_id}`}>
                      Bu Projeyi Destekle
                    </Link>
                  </Button>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    {project.status === 'Completed' ? 'Proje tamamlandı' : 'Şu an bağış kabul edilmiyor'}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t space-y-1 text-xs text-muted-foreground">
                  {project.timeline?.length > 0 && (
                    <p>Süre: {project.timeline.length} aşama</p>
                  )}
                  {project.video_url && (
                    <a href={project.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                      Tanıtım videosu →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
