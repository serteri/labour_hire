import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { orgId: true },
  })
  return membership?.orgId ?? null
}

async function getOwnedAlert(id: string, orgId: string) {
  return prisma.complianceAlert.findFirst({ where: { id, orgId } })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const orgId = await getOrgId(session.user.id)
  if (!orgId) {
    return NextResponse.json({ error: 'No organisation found' }, { status: 404 })
  }

  const { id } = await params
  const existing = await getOwnedAlert(id, orgId)
  if (!existing) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  }

  const body = await request.json()
  const { isRead, isDismissed } = body as { isRead?: boolean; isDismissed?: boolean }

  if (isRead === undefined && isDismissed === undefined) {
    return NextResponse.json({ error: 'Invalid input: provide isRead or isDismissed' }, { status: 400 })
  }

  const updated = await prisma.complianceAlert.update({
    where: { id },
    data: {
      ...(isRead !== undefined && { isRead }),
      ...(isDismissed !== undefined && { isDismissed }),
      ...(isDismissed && { resolvedAt: new Date() }), // If dismissed, mark as resolved
    },
  })

  return NextResponse.json(updated)
}
