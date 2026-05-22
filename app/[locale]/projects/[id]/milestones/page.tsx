import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MilestoneManagementPanel } from '@/components/project/MilestoneManagementPanel'

interface Props { params: { id: string } }

export default async function MilestoneManagementPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">Dönüm Noktası Yönetimi</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Kanıt yükleyin ve ödeme kilit açma talepleri gönderin
          </p>
          <MilestoneManagementPanel projectId={params.id} />
        </div>
      </main>
      <Footer />
    </>
  )
}
