import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLicenceStatus } from '@/lib/utils'
import { z } from 'zod'

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { orgId: true },
  })
  return membership?.orgId ?? null
}

const PatchSchema = z.object({
  licenceNumber: z.string().optional(),
  licenceType: z.string().optional(),
  issuedDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRING', 'URGENT', 'EXPIRED', 'SUSPENDED', 'PENDING']).optional(),
})

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

  // Verify ownership before update
  const existing = await prisma.licenceRecord.findFirst({
    where: { id, orgId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Licence not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { expiryDate, issuedDate, ...rest } = parsed.data

  const expiryDateObj = expiryDate ? new Date(expiryDate) : existing.expiryDate
  const autoStatus = calculateLicenceStatus(expiryDateObj)

  const updated = await prisma.licenceRecord.update({
    where: { id },
    data: {
      ...rest,
      issuedDate: issuedDate ? new Date(issuedDate) : existing.issuedDate,
      expiryDate: expiryDateObj,
      // Only auto-update status if not manually setting SUSPENDED or PENDING
      status: rest.status ?? autoStatus,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
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

  // Verify ownership before delete
  const existing = await prisma.licenceRecord.findFirst({
    where: { id, orgId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Licence not found' }, { status: 404 })
  }

  // Delete related alerts first
  await prisma.complianceAlert.deleteMany({
    where: {
      relatedId: id,
      relatedType: 'LICENCE',
      orgId,
    },
  })

  await prisma.licenceRecord.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
