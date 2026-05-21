import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AddWorkerDialog } from '@/components/workers/AddWorkerDialog'
import { WorkerTable } from '@/components/workers/WorkerTable'

function daysUntil(date: Date | null): number | null {
  if (!date) return null
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

async function getOrgWorkers(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { orgId: true },
  })
  if (!membership) return null

  const workers = await prisma.workerRecord.findMany({
    where: { orgId: membership.orgId, isActive: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })

  return workers
}

export default async function WorkersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const workers = await getOrgWorkers(session.user.id)
  if (!workers) redirect('/login')

  const totalWorkers = workers.length
  const validCount = workers.filter((w) => w.workRightStatus === 'VALID').length
  const expiringCount = workers.filter((w) => {
    const days = daysUntil(w.visaExpiryDate)
    return days !== null && days >= 0 && days <= 90
  }).length
  const expiredCount = workers.filter((w) => {
    const days = daysUntil(w.visaExpiryDate)
    return days !== null && days < 0
  }).length

  const stats = [
    { label: 'Total workers', value: totalWorkers, className: 'bg-slate-100 text-slate-700' },
    { label: 'Valid work rights', value: validCount, className: 'bg-green-100 text-green-700' },
    {
      label: 'Expiring within 90 days',
      value: expiringCount,
      className: 'bg-amber-100 text-amber-700',
    },
    { label: 'Expired', value: expiredCount, className: 'bg-red-100 text-red-700' },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Worker Records</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep worker documentation and visa timelines audit-ready.
          </p>
        </div>
        <AddWorkerDialog />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${stat.className}`}
          >
            <span className="text-lg font-bold">{stat.value}</span>
            <span className="font-normal">{stat.label}</span>
          </div>
        ))}
      </div>

      <WorkerTable initialWorkers={workers} />

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Workers with expiring visas will appear in your compliance alerts automatically.
      </div>
    </div>
  )
}
