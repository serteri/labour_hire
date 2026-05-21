import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_STATES = ['VIC', 'QLD', 'SA', 'ACT', 'WA', 'NSW', 'TAS', 'NT'] as const

type StateCode = (typeof VALID_STATES)[number]

function isValidState(value: unknown): value is StateCode {
  return typeof value === 'string' && VALID_STATES.includes(value as StateCode)
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = (await request.json()) as {
      organisationName?: string
      abn?: string
      state?: string
    }

    const organisationName = body.organisationName?.trim()
    const abn = body.abn?.trim()
    const state = body.state?.trim()

    if (!organisationName) {
      return NextResponse.json({ error: 'Organisation name is required' }, { status: 400 })
    }

    if (!isValidState(state)) {
      return NextResponse.json({ error: 'A valid state is required' }, { status: 400 })
    }

    const existingMembership = await prisma.organizationMember.findFirst({
      where: { userId },
      select: { orgId: true },
    })

    if (existingMembership) {
      return NextResponse.json({ success: true })
    }

    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: organisationName,
          abn: abn || null,
          state,
          accountType: 'PROVIDER',
          plan: 'FREE',
        },
      })

      await tx.organizationMember.create({
        data: {
          orgId: org.id,
          userId,
          role: 'OWNER',
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[REGISTER ORG]', error)
    return NextResponse.json({ error: 'Failed to create organisation' }, { status: 500 })
  }
}
