import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ProjectWizard } from '@/components/project/ProjectWizard'

export default function CreateProjectPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">Proje Başvurusu</h1>
          <p className="text-muted-foreground text-sm mb-8">4 adımda başvurunuzu tamamlayın</p>
          <ProjectWizard />
        </div>
      </main>
      <Footer />
    </>
  )
}
