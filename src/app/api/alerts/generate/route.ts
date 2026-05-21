import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateAlertsForOrg } from '@/lib/alerts'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orgId = session.user.orgId
  if (!orgId) return NextResponse.json({ error: 'Organization ID not found in session' }, { status: 400 })

  try {
    await generateAlertsForOrg(orgId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Alerts Generate POST]', error)
    return NextResponse.json({ error: 'Failed to generate alerts' }, { status: 500 })
  }
}
