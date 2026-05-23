import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { applyPrivacySettings, ViewerRole } from '@/lib/student-privacy'
import { ProfileHeader } from '@/components/student-passport/ProfileHeader'
import { VerificationBadges } from '@/components/student-passport/VerificationBadges'
import { Timeline } from '@/components/student-passport/Timeline'
import { MessageForm } from '@/components/student-passport/MessageForm'
import { JsonLd } from '@/components/seo/JsonLd'
import { personSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import { studentMetadata, type StudentSeoData } from '@/lib/seo/generate-metadata'

async function getStudentProfile(id: string) {
  try {
    const db = await getDb()
    const [profile, user, verifications] = await Promise.all([
      db.collection('student_profiles').findOne({ user_id: id }),
      ObjectId.isValid(id)
        ? db.collection('users').findOne(
            { _id: new ObjectId(id) },
            { projection: { name: 1, image: 1 } }
          )
        : null,
      db.collection('verifications')
        .find({ user_id: id, status: 'approved' }, { projection: { type: 1, status: 1 } })
        .toArray(),
    ])
    if (!user) return null

    const mappedProfile = {
      ...(profile || {}),
      photoUrl: user.image || null,
      schoolName: profile?.university || null,
      major: profile?.fieldOfStudy || profile?.field_of_study || null,
      shortStory: profile?.shortStory || null,
    }
    const settings = {
      ageVisibility: profile?.ageVisibility || 'EVERYONE',
      gpaVisibility: profile?.gpaVisibility || 'DONORS_ONLY',
      storyVisibility: profile?.storyVisibility || 'EVERYONE',
    }
    return {
      profile: mappedProfile,
      settings,
      user,
      verifications: verifications.map((v: any) => ({ type: v.type, status: 'APPROVED' })),
      achievements: [],
    }
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: { id: string; locale: string } }
): Promise<Metadata> {
  const data = await getStudentProfile(params.id)
  if (!data) return { title: 'Öğrenci Bulunamadı — FundEd' }
  const p = data.profile as any
  const seoData: StudentSeoData = {
    userId: params.id,
    name: data.user.name || 'Öğrenci',
    image: data.user.image,
    fieldOfStudy: p.fieldOfStudy || p.field_of_study,
    university: p.university,
    shortStory: p.shortStory,
  }
  return studentMetadata(seoData, params.locale)
}

export default async function StudentProfilePage({
  params,
}: { params: { id: string; locale: string } }) {
  const data = await getStudentProfile(params.id)
  if (!data) return notFound()

  const { profile, settings, user, verifications, achievements } = data
  const isTr = params.locale === 'tr'
  const studentUrl = `https://www.fund-ed.com/${params.locale}/student/${params.id}`

  const viewerRole: ViewerRole = 'EVERYONE'
  const safeProfile = applyPrivacySettings(profile, settings, viewerRole)

  const schemas = [
    personSchema({
      name: user.name || 'Öğrenci',
      description: safeProfile.shortStory || '',
      imageUrl: user.image,
      url: studentUrl,
    }),
    breadcrumbSchema(isTr
      ? [
          { name: 'Ana Sayfa', url: 'https://www.fund-ed.com/tr' },
          { name: 'Öğrenci Profili', url: studentUrl },
        ]
      : [
          { name: 'Home', url: 'https://www.fund-ed.com/en' },
          { name: 'Student Profile', url: studentUrl },
        ]
    ),
  ]

  return (
    <>
      {schemas.map((s, i) => <JsonLd key={i} schema={s} />)}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ProfileHeader profile={safeProfile} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Timeline achievements={achievements} />
            </div>
            <div className="space-y-6">
              <VerificationBadges verifications={verifications} />
              <MessageForm studentId={params.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
