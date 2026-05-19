// app/api/og/student/[id]/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  let name = 'Student'
  let fieldOfStudy = ''
  let university = ''
  let photoSrc: string | undefined

  try {
    const db = await getDb()
    const [profile, user] = await Promise.all([
      db.collection('student_profiles').findOne(
        { user_id: params.id },
        { projection: { fieldOfStudy: 1, field_of_study: 1, university: 1 } }
      ),
      ObjectId.isValid(params.id)
        ? db.collection('users').findOne(
            { _id: new ObjectId(params.id) },
            { projection: { name: 1, image: 1 } }
          )
        : null,
    ])
    if (user?.name) name = user.name
    fieldOfStudy = profile?.fieldOfStudy || profile?.field_of_study || ''
    university = profile?.university || ''

    const photoUrl = user?.image || null
    if (photoUrl) {
      const res = await fetch(photoUrl)
      if (res.ok) {
        const buf = await res.arrayBuffer()
        const base64 = Buffer.from(buf).toString('base64')
        const mime = res.headers.get('content-type') || 'image/jpeg'
        photoSrc = `data:${mime};base64,${base64}`
      }
    }
  } catch {
    // return generic image below
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          display: 'flex', fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
        }}
      >
        {/* Left panel */}
        <div
          style={{
            width: '660px', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '60px 56px',
          }}
        >
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <span style={{ fontSize: 16, color: 'rgba(199,210,254,0.7)', fontWeight: 600 }}>
              🎓 fund-ed.com
            </span>
          </div>
          <div
            style={{
              fontSize: 52, fontWeight: 800, color: '#ffffff',
              lineHeight: 1.1, marginBottom: 20, display: 'flex', flexWrap: 'wrap',
            }}
          >
            {name.slice(0, 40)}
          </div>
          {fieldOfStudy && (
            <div style={{ fontSize: 24, color: '#93c5fd', marginBottom: 8, display: 'flex' }}>
              {fieldOfStudy.slice(0, 60)}
            </div>
          )}
          {university && (
            <div style={{ fontSize: 18, color: 'rgba(199,210,254,0.6)', display: 'flex' }}>
              {university.slice(0, 60)}
            </div>
          )}
          <div
            style={{
              marginTop: 40, background: 'rgba(99,102,241,0.3)',
              borderRadius: 20, padding: '8px 20px', display: 'flex',
              alignItems: 'center', gap: 8, width: 'fit-content',
            }}
          >
            <span style={{ color: '#a5b4fc', fontSize: 16, fontWeight: 600 }}>
              ✓ Doğrulanmış Öğrenci
            </span>
          </div>
        </div>

        {/* Right panel — photo */}
        <div
          style={{
            width: '540px', height: '100%',
            display: 'flex', position: 'relative', overflow: 'hidden',
          }}
        >
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoSrc}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'flex' }}
            />
          ) : (
            <div
              style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(180deg, #4338ca 0%, #1e1b4b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 120,
              }}
            >
              👤
            </div>
          )}
          <div
            style={{
              position: 'absolute', top: 0, left: 0,
              width: 100, height: '100%',
              background: 'linear-gradient(90deg, #1e3a8a, transparent)',
              display: 'flex',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
