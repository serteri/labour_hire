import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLicenceStatus } from '@/lib/utils'
import { AddLicenceSchema } from '@/lib/validations'

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { orgId: true },
  })
  return membership?.orgId ?? null
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const orgId = await getOrgId(session.user.id)
  if (!orgId) {
    return NextResponse.json({ error: 'No organisation found' }, { status: 404 })
  }

  const licences = await prisma.licenceRecord.findMany({
    where: { orgId },
    orderBy: { expiryDate: 'asc' },
  })

  return NextResponse.json(licences)
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
  const parsed = AddLicenceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { state, licenceNumber, licenceType, issuedDate, expiryDate, notes } = parsed.data

  const expiryDateObj = new Date(expiryDate)
  const status = calculateLicenceStatus(expiryDateObj)

  try {
    const licence = await prisma.licenceRecord.create({
      data: {
        orgId,
        state,
        licenceNumber: licenceNumber || null,
        licenceType: licenceType || null,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        expiryDate: expiryDateObj,
        status,
        notes: notes || null,
      },
    })
    return NextResponse.json(licence, { status: 201 })
  } catch (error: unknown) {
    // Unique constraint violation — licence already exists for this state
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: `A licence for ${state} already exists. Use edit to update it.` },
        { status: 409 }
      )
    }
    console.error('[LICENCES POST]', error)
    return NextResponse.json({ error: 'Failed to create licence' }, { status: 500 })
  }
}
