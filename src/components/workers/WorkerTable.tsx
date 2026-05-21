'use client'

import { useEffect, useMemo, useState } from 'react'
import { WorkRightStatus, WorkerRecord } from '@prisma/client'
import { Search } from 'lucide-react'
import { WorkerStatusBadge } from '@/components/workers/WorkerStatusBadge'
import { EditWorkerDialog } from '@/components/workers/EditWorkerDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn, formatAUDate } from '@/lib/utils'

type WorkerLike = Omit<WorkerRecord, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date
  updatedAt: string | Date
  visaExpiryDate: string | Date | null
  policeCheckExpiry: string | Date | null
}

type FilterType = 'ALL' | 'EXPIRING' | 'EXPIRED' | 'RESTRICTED'

interface WorkerTableProps {
  initialWorkers: WorkerLike[]
}

function toDate(date: string | Date | null): Date | null {
  if (!date) return null
  return new Date(date)
}

function daysUntil(date: string | Date | null): number | null {
  const parsed = toDate(date)
  if (!parsed) return null
  const diffMs = parsed.getTime() - Date.now()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function expiryText(date: string | Date | null): string {
  const parsed = toDate(date)
  if (!parsed) return 'Not applicable'

  const days = daysUntil(parsed)
  if (days === null) return 'Not applicable'
  if (days < 0) return `${formatAUDate(parsed)} (${Math.abs(days)}d overdue)`
  if (days === 0) return `${formatAUDate(parsed)} (today)`
  return `${formatAUDate(parsed)} (${days}d)`
}

export function WorkerTable({ initialWorkers }: WorkerTableProps) {
  const [workers, setWorkers] = useState<WorkerLike[]>(initialWorkers)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [editingWorker, setEditingWorker] = useState<WorkerLike | null>(null)

  useEffect(() => {
    let active = true

    async function fetchWorkers() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/workers', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as WorkerLike[]
        if (active) setWorkers(data)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void fetchWorkers()

    return () => {
      active = false
    }
  }, [])

  const filteredWorkers = useMemo(() => {
    const term = search.trim().toLowerCase()

    return workers.filter((worker) => {
      const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase()
      const nameMatch = !term || fullName.includes(term)

      const filterMatch =
        filter === 'ALL' ||
        (filter === 'EXPIRING' && worker.workRightStatus === 'EXPIRING') ||
        (filter === 'EXPIRED' && worker.workRightStatus === 'EXPIRED') ||
        (filter === 'RESTRICTED' && worker.workRightStatus === 'RESTRICTED')

      return nameMatch && filterMatch
    })
  }, [workers, search, filter])

  const pills: Array<{ label: string; value: FilterType; activeClass: string }> = [
    { label: 'All', value: 'ALL', activeClass: 'bg-slate-800 text-white border-slate-800' },
    { label: 'Expiring', value: 'EXPIRING', activeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
    { label: 'Expired', value: 'EXPIRED', activeClass: 'bg-red-100 text-red-800 border-red-200' },
    { label: 'Restricted', value: 'RESTRICTED', activeClass: 'bg-orange-100 text-orange-800 border-orange-200' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search workers by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <Button
              key={pill.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFilter(pill.value)}
              className={cn(
                'rounded-full border-slate-200',
                filter === pill.value ? pill.activeClass : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {['Name', 'Job Title', 'Work Rights', 'Visa Expiry', 'Police Check', 'WHS', 'Actions'].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-slate-200" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-2">
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 px-6 text-center">
          <p className="text-slate-700 font-medium">No workers added yet.</p>
          <p className="text-sm text-slate-500 mt-1">
            Add your first worker to start tracking compliance.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Work Rights</TableHead>
                  <TableHead>Visa Expiry</TableHead>
                  <TableHead>Police Check</TableHead>
                  <TableHead>WHS</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => {
                  const visaDays = daysUntil(worker.visaExpiryDate)
                  const policeDays = daysUntil(worker.policeCheckExpiry)

                  return (
                    <TableRow
                      key={worker.id}
                      className="cursor-pointer"
                      onClick={() => setEditingWorker(worker)}
                    >
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {worker.firstName} {worker.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{worker.email || 'No email'}</div>
                      </TableCell>
                      <TableCell className="text-slate-700">{worker.jobTitle || '—'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <WorkerStatusBadge status={worker.workRightStatus} />
                          <p className="text-xs text-slate-500">{worker.visaType || 'Not specified'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            visaDays === null && 'text-slate-500',
                            visaDays !== null && visaDays < 0 && 'text-red-600',
                            visaDays !== null && visaDays >= 0 && visaDays <= 90 && 'text-amber-700',
                            visaDays !== null && visaDays > 90 && 'text-slate-700'
                          )}
                        >
                          {expiryText(worker.visaExpiryDate)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className={cn('text-sm font-medium', policeDays !== null && policeDays < 0 ? 'text-red-600' : 'text-slate-700')}>
                          {worker.policeCheckExpiry ? formatAUDate(worker.policeCheckExpiry) : '—'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className={cn('text-xl font-bold', worker.whsInduction ? 'text-green-600' : 'text-red-600')}>
                          {worker.whsInduction ? '✓' : '✗'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            setEditingWorker(worker)
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3">
            {filteredWorkers.map((worker) => {
              const visaDays = daysUntil(worker.visaExpiryDate)

              return (
                <button
                  type="button"
                  key={worker.id}
                  onClick={() => setEditingWorker(worker)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {worker.firstName} {worker.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{worker.jobTitle || 'No job title'}</p>
                    </div>
                    <WorkerStatusBadge status={worker.workRightStatus} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400">Visa expiry</p>
                      <p
                        className={cn(
                          'font-medium',
                          visaDays === null && 'text-slate-500',
                          visaDays !== null && visaDays < 0 && 'text-red-600',
                          visaDays !== null && visaDays >= 0 && visaDays <= 90 && 'text-amber-700',
                          visaDays !== null && visaDays > 90 && 'text-slate-700'
                        )}
                      >
                        {worker.visaExpiryDate ? formatAUDate(worker.visaExpiryDate) : 'Not applicable'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Police check</p>
                      <p className="font-medium text-slate-700">
                        {worker.policeCheckExpiry ? formatAUDate(worker.policeCheckExpiry) : '—'}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {editingWorker && (
        <EditWorkerDialog
          worker={editingWorker}
          open={Boolean(editingWorker)}
          onOpenChange={(open) => {
            if (!open) setEditingWorker(null)
          }}
        />
      )}
    </div>
  )
}
