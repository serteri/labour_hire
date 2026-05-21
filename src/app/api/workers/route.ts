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
  const status = searchParams.get('status')
  const search = searchParams.get('search')?.trim()

  const workers = await prisma.workerRecord.findMany({
    where: {
      orgId,
      ...(status
        ? {
            workRightStatus: status as WorkRightStatus,
          }
        : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })

  return NextResponse.json(workers)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const orgId = await getOrgId(session.user.id)
  if (!orgId) {
    return NextResponse.json({ error: 'No organisation found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = workerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data
  const isCitizenOrPR = Boolean(data.visaType && CITIZEN_OR_PR.includes(data.visaType as (typeof CITIZEN_OR_PR)[number]))
  const visaExpiryDate = isCitizenOrPR ? null : data.visaExpiryDate || null
  const workRightStatus = calculateWorkRightStatus(visaExpiryDate)

  const worker = await prisma.workerRecord.create({
    data: {
      orgId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      jobTitle: data.jobTitle || null,
      visaType: data.visaType || null,
      visaSubclass: data.visaSubclass || null,
      visaExpiryDate: visaExpiryDate ? new Date(visaExpiryDate) : null,
      workRightStatus,
      workHoursLimit: isCitizenOrPR ? null : (data.workHoursLimit ?? null),
      policeCheckDate: data.policeCheckDate ? new Date(data.policeCheckDate) : null,
      policeCheckExpiry: data.policeCheckExpiry ? new Date(data.policeCheckExpiry) : null,
      whsInduction: data.whsInduction,
      whsInductionDate: data.whsInduction && data.whsInductionDate ? new Date(data.whsInductionDate) : null,
      notes: data.notes || null,
    },
  })

  return NextResponse.json(worker, { status: 201 })
}
