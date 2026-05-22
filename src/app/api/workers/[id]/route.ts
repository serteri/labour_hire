import { NextRequest, NextResponse } from 'next/server'
import { WorkRightStatus } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { workerSchema } from '@/lib/validations'

const CITIZEN_OR_PR = ['Australian Citizen', 'Permanent Resident'] as const

function calculateWorkRightStatus(visaExpiryDate?: string | null): WorkRightStatus {
  if (!visaExpiryDate) return 'VALID'

  const expiry = new Date(visaExpiryDate)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'EXPIRED'
  if (daysUntilExpiry <= 90) return 'EXPIRING'
  return 'VALID'
}

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { orgId: true },
  })
  return membership?.orgId ?? null
}

async function getOwnedWorker(id: string, orgId: string) {
  return prisma.workerRecord.findFirst({ where: { id, orgId } })
}

export async function GET(
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
  const worker = await getOwnedWorker(id, orgId)

  if (!worker) {
    return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
  }

  return NextResponse.json(worker)
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
  const existing = await getOwnedWorker(id, orgId)
  if (!existing) {
    return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = workerSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data
  const visaType = data.visaType ?? existing.visaType
  const isCitizenOrPR = Boolean(visaType && CITIZEN_OR_PR.includes(visaType as (typeof CITIZEN_OR_PR)[number]))

  const visaExpiryDateRaw = isCitizenOrPR
    ? null
    : (data.visaExpiryDate !== undefined ? data.visaExpiryDate : (existing.visaExpiryDate ? existing.visaExpiryDate.toISOString().slice(0, 10) : null))

  const workRightStatus = calculateWorkRightStatus(visaExpiryDateRaw)

  const updated = await prisma.workerRecord.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email === '' ? null : data.email,
      phone: data.phone,
      jobTitle: data.jobTitle,
      visaType: data.visaType,
      visaSubclass: data.visaSubclass,
      visaExpiryDate: visaExpiryDateRaw ? new Date(visaExpiryDateRaw) : null,
      workRightStatus,
      workHoursLimit: isCitizenOrPR ? null : (data.workHoursLimit ?? existing.workHoursLimit),
      policeCheckDate:
        data.policeCheckDate === undefined
          ? undefined
          : data.policeCheckDate
            ? new Date(data.policeCheckDate)
            : null,
      policeCheckExpiry:
        data.policeCheckExpiry === undefined
          ? undefined
          : data.policeCheckExpiry
            ? new Date(data.policeCheckExpiry)
            : null,
      whsInduction: data.whsInduction,
      whsInductionDate:
        data.whsInduction === false
          ? null
          : data.whsInductionDate === undefined
            ? undefined
            : data.whsInductionDate
              ? new Date(data.whsInductionDate)
              : null,
      notes: data.notes,
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
  const existing = await getOwnedWorker(id, orgId)

  if (!existing) {
    return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
  }

  await prisma.complianceAlert.deleteMany({
    where: {
      relatedId: id,
      relatedType: 'WORKER',
      orgId,
    },
  })

  await prisma.workerRecord.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
