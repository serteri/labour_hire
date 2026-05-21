import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AlertSeverity, ComplianceAlert } from '@prisma/client'
import { generateAlertsForOrg } from '@/lib/alerts'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Info, BellRing, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Client component for interactivity
import { AlertsClientPage } from './alerts-client-page'

async function getOrgId(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { orgId: true },
  })
  return membership?.orgId ?? null
}

async function getAlerts(orgId: string): Promise<ComplianceAlert[]> {
  return prisma.complianceAlert.findMany({
    where: {
      orgId,
      isDismissed: false, // Only fetch active alerts for the main view
    },
    orderBy: [
      { severity: 'desc' },
      { createdAt: 'desc' },
    ],
  })
}

export default async function AlertsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const orgId = await getOrgId(session.user.id)
  if (!orgId) redirect('/login')

  // Automatically generate alerts on page load
  // This ensures the page is always up-to-date with compliance issues.
  await generateAlertsForOrg(orgId).catch(console.error)

  const alerts = await getAlerts(orgId)

  return <AlertsClientPage initialAlerts={alerts} orgId={orgId} />
}
