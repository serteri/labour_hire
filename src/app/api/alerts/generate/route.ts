import { auth } from '@/lib/auth'
import { generateAlertsForOrg } from '@/lib/alerts'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const orgId = (session.user as { orgId?: string }).orgId
  if (!orgId) return Response.json({ error: 'No org' }, { status: 400 })

  await generateAlertsForOrg(orgId)

  const owner = await prisma.organizationMember.findFirst({
    where: { orgId, role: 'OWNER' },
    include: { user: true },
  })

  return Response.json({
    success: true,
    orgId,
    ownerEmail: owner?.user?.email ?? 'NOT FOUND',
  })
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const orgId = (session.user as { orgId?: string }).orgId
  if (!orgId) return Response.json({ error: 'No orgId' }, { status: 400 })

  const owner = await prisma.organizationMember.findFirst({
    where: { orgId, role: 'OWNER' },
    include: { user: true },
  })

  if (!owner?.user?.email) {
    return Response.json({ error: 'Owner not found' }, { status: 404 })
  }

  let emailResult: unknown = null
  let emailError: string | null = null

  try {
    const { sendAlertEmail } = await import('@/lib/email')
    emailResult = await sendAlertEmail({
      to: owner.user.email,
      alertTitle: 'Debug Test — Alert Email',
      alertDescription: 'Testing email from alerts generate endpoint.',
      daysUntil: 15,
      actionUrl: process.env.NEXT_PUBLIC_APP_URL + '/licences',
    })
  } catch (error) {
    emailError = String(error)
  }

  return Response.json({
    orgId,
    ownerEmail: owner.user.email,
    emailResult,
    emailError,
    resendKeySet: !!process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
  })
}
