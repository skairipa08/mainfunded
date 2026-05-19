'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ProjectCard } from '@/components/project/ProjectCard'
import { ProjectFilters } from '@/components/project/ProjectFilters'
import type { Project } from '@/types/projects'

export const dynamic = 'force-dynamic'

function ProjectsContent() {
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<(Project & { escrow?: { total_collected: number } })[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    setLoading(true)
    fetch(`/api/projects?${params.toString()}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setProjects(json.data)
          setTotal(json.pagination?.total ?? json.data.length)
        }
      })
      .finally(() => setLoading(false))
  }, [searchParams])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Projeler</h1>
        <p className="text-muted-foreground">
          Öğrenci ve ekip projelerini keşfet, destekle.
        </p>
      </div>

      <ProjectFilters />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-2">Proje bulunamadı.</p>
          <p className="text-sm">Filtrelerinizi değiştirmeyi deneyin.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{total} proje bulundu</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(p => (
              <ProjectCard key={p.project_id} project={p} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="h-8 w-8 animate-spin border-4 border-blue-200 border-t-blue-600 rounded-full" />
          </div>
        }>
          <ProjectsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
