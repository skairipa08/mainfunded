import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ESGImpactPanel } from '@/components/project/ESGImpactPanel'

export default async function ProjectsImpactPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-2">Proje Etki Paneli</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Desteklediğiniz projelerin toplumsal etkisini görün.
          </p>
          <ESGImpactPanel />
        </div>
      </main>
      <Footer />
    </>
  )
}
