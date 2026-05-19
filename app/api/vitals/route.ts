// app/api/vitals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { saveVital, getVitalsSummary, type VitalRecord } from '@/lib/vitals'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as VitalRecord
    if (!body.metric || typeof body.value !== 'number') {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    await saveVital(body)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
    const summary = await getVitalsSummary()
    return NextResponse.json(summary)
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
