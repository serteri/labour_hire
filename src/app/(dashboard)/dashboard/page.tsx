import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLicenceStatus, daysUntilExpiry, formatAUDate } from '@/lib/utils'
import { generateAlertsForOrg } from '@/lib/alerts'

function daysUntil(date: Date | null): number | null {
  // ...existing code...
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    select: {
      orgId: true,
      organization: { select: { name: true } },
    },
  })

  if (!membership) redirect('/login')

  const orgId = membership.orgId

  // Silently generate fresh alerts on every dashboard visit
  // This ensures alerts are always up to date
  await generateAlertsForOrg(orgId).catch(console.error)

  const [licences, workers, unreadAlerts] = await Promise.all([
    prisma.licenceRecord.findMany({
      where: { orgId: membership.orgId },
      orderBy: { expiryDate: 'asc' },
    }),
    prisma.workerRecord.findMany({
      where: { orgId: membership.orgId, isActive: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
    prisma.complianceAlert.count({
      where: { orgId: membership.orgId, isRead: false, isDismissed: false },
    }),
  ])

  const liveLicences = licences.map((licence) => ({
    ...licence,
    status: calculateLicenceStatus(licence.expiryDate),
  }))

  const licenceExpiring = liveLicences.filter(
    (licence) => licence.status === 'EXPIRING' || licence.status === 'URGENT'
  ).length
  const licenceExpired = liveLicences.filter((licence) => licence.status === 'EXPIRED').length

  const workersExpiring = workers.filter((worker) => {
    const days = daysUntil(worker.visaExpiryDate)
    return days !== null && days >= 0 && days <= 90
  }).length
  const workersExpired = workers.filter((worker) => {
    const days = daysUntil(worker.visaExpiryDate)
    return days !== null && days < 0
  }).length

  const criticalCount = licenceExpired + workersExpired
  const soonCount = licenceExpiring + workersExpiring

  const upcomingLicenceItems = liveLicences
    .filter((licence) => {
      const days = daysUntilExpiry(licence.expiryDate)
      return days <= 120
    })
    .slice(0, 5)

  const upcomingWorkerItems = workers
    .filter((worker) => {
      const days = daysUntil(worker.visaExpiryDate)
      return days !== null && days <= 120
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
        <p className="mt-1 text-sm text-slate-500">
          {membership.organization.name} compliance snapshot across licences and workers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total licences</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{licences.length}</p>
          <p className="mt-1 text-sm text-slate-500">{licenceExpiring} expiring soon</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Active workers</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{workers.length}</p>
          <p className="mt-1 text-sm text-slate-500">{workersExpiring} visa renewals due</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-700">Needs attention</p>
          <p className="mt-2 text-3xl font-bold text-amber-800">{soonCount}</p>
          <p className="mt-1 text-sm text-amber-700">Due within 90 days</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs uppercase tracking-wide text-red-700">Critical issues</p>
          <p className="mt-2 text-3xl font-bold text-red-800">{criticalCount}</p>
          <p className="mt-1 text-sm text-red-700">Expired items requiring action</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Upcoming Licence Deadlines</h3>
            <Link href="/licences" className="text-sm text-blue-600 hover:underline">
              View licences
            </Link>
          </div>

          {upcomingLicenceItems.length === 0 ? (
            <p className="text-sm text-slate-500">No licence deadlines in the next 120 days.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingLicenceItems.map((licence) => {
                const days = daysUntilExpiry(licence.expiryDate)
                return (
                  <li key={licence.id} className="rounded-lg border border-slate-200 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{licence.state} licence</p>
                        <p className="text-xs text-slate-500">Expires {formatAUDate(licence.expiryDate)}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          days < 0
                            ? 'text-red-600'
                            : days <= 30
                              ? 'text-amber-700'
                              : 'text-slate-600'
                        }`}
                      >
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Upcoming Worker Visa Deadlines</h3>
            <Link href="/workers" className="text-sm text-blue-600 hover:underline">
              View workers
            </Link>
          </div>

          {upcomingWorkerItems.length === 0 ? (
            <p className="text-sm text-slate-500">No worker visa deadlines in the next 120 days.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingWorkerItems.map((worker) => {
                const days = daysUntil(worker.visaExpiryDate)
                return (
                  <li key={worker.id} className="rounded-lg border border-slate-200 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {worker.firstName} {worker.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {worker.visaExpiryDate
                            ? `Visa expires ${formatAUDate(worker.visaExpiryDate)}`
                            : 'No visa expiry date'}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          days !== null && days < 0
                            ? 'text-red-600'
                            : days !== null && days <= 30
                              ? 'text-amber-700'
                              : 'text-slate-600'
                        }`}
                      >
                        {days === null ? 'N/A' : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Open Compliance Alerts</p>
            <p className="text-sm text-slate-500">Unread and undismissed alerts requiring review.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {unreadAlerts} open
            </span>
            <Link href="/alerts" className="text-sm text-blue-600 hover:underline">
              Open alerts
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
