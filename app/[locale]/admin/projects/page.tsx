import { AdminProjectsPanel } from '@/components/project/AdminProjectsPanel'

export default function AdminProjectsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Proje Yönetimi</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Proje başvurularını incele, onayla veya reddet.
      </p>
      <AdminProjectsPanel />
    </div>
  )
}
