import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AlertSeverity } from '@prisma/client'

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { orgId: true },
  })
  return membership?.orgId ?? null
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const orgId = await getOrgId(session.user.id)
  if (!orgId) {
    return NextResponse.json({ error: 'No organisation found' }, { status: 404 })
  }

  const searchParams = request.nextUrl.searchParams
  const unread = searchParams.get('unread') === 'true'
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

  const alerts = await prisma.complianceAlert.findMany({
    where: {
      orgId,
      isDismissed: false,
      ...(unread && { isRead: false }),
    },
    orderBy: [
      { severity: 'desc' }, // CRITICAL first
      { createdAt: 'desc' },
    ],
    take: limit,
  })

  return NextResponse.json(alerts)
}

