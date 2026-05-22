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
