import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AustralianState, LicenceRecord, LicenceStatus } from '@prisma/client'
import { ACTIVE_STATES } from '@/lib/compliance'
import { calculateLicenceStatus } from '@/lib/utils'
import { LicenceCard } from '@/components/licences/LicenceCard'
import { AddLicenceDialog } from '@/components/licences/AddLicenceDialog'

async function getOrgLicences(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { orgId: true },
  })
  if (!membership) return null

  const licences = await prisma.licenceRecord.findMany({
    where: { orgId: membership.orgId },
  })

  return { orgId: membership.orgId, licences }
}

export default async function LicencesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const data = await getOrgLicences(session.user.id)
  if (!data) redirect('/login')

  const { licences } = data

  // Build a map of state → licence for quick lookup
  const licenceByState = new Map<AustralianState, LicenceRecord>(
    licences.map((l) => [l.state, l])
  )

  // Recalculate statuses from live dates (schema status may be stale)
  const liveLicences = licences.map((l) => ({
    ...l,
    status: calculateLicenceStatus(new Date(l.expiryDate)),
  }))

  // Stats
  const totalTracked = licences.length
  const activeCount = liveLicences.filter((l) => l.status === 'ACTIVE').length
  const expiringCount = liveLicences.filter(
    (l): l is typeof l & { status: LicenceStatus } =>
      l.status === 'EXPIRING' || l.status === 'URGENT'
  ).length
  const criticalCount = liveLicences.filter(
    (l) => l.status === 'EXPIRED' || l.status === 'URGENT'
  ).length

  const statPills = [
    { label: 'Licences tracked', value: totalTracked, colour: 'text-slate-700 bg-slate-100' },
    { label: 'Active', value: activeCount, colour: 'text-green-700 bg-green-100' },
    { label: 'Expiring within 90 days', value: expiringCount, colour: 'text-amber-700 bg-amber-100' },
    { label: 'Expired / Urgent', value: criticalCount, colour: 'text-red-700 bg-red-100' },
  ]

  // States to show: all ACTIVE_STATES + WA
  const displayStates: AustralianState[] = [...ACTIVE_STATES, 'WA']

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Licence Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage your Australian labour hire licences across all states.
          </p>
        </div>
        <AddLicenceDialog />
      </div>

      {/* Stats pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        {statPills.map((pill) => (
          <div
            key={pill.label}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${pill.colour}`}
          >
            <span className="text-lg font-bold">{pill.value}</span>
            <span className="font-normal">{pill.label}</span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {totalTracked === 0 && (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 mb-8">
          <p className="text-lg font-medium text-slate-700 mb-2">No licences registered yet</p>
          <p className="text-sm mb-4">
            Start by adding your first licence. Select the state where you operate.
          </p>
          <AddLicenceDialog triggerLabel="Add Your First Licence" />
        </div>
      )}

      {/* State cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayStates.map((state) => (
          <LicenceCard
            key={state}
            state={state}
            licence={licenceByState.get(state) ?? null}
          />
        ))}
      </div>
    </div>
  )
}

