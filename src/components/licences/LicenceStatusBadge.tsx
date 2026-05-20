import { LicenceStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<LicenceStatus, { label: string; className: string }> = {
  ACTIVE:    { label: 'Active',         className: 'bg-green-100 text-green-800 border-green-200' },
  EXPIRING:  { label: 'Expiring Soon',  className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  URGENT:    { label: 'Urgent',         className: 'bg-orange-100 text-orange-800 border-orange-200' },
  EXPIRED:   { label: 'Expired',        className: 'bg-red-100 text-red-800 border-red-200' },
  SUSPENDED: { label: 'Suspended',      className: 'bg-red-100 text-red-800 border-red-200' },
  PENDING:   { label: 'Pending',        className: 'bg-blue-100 text-blue-800 border-blue-200' },
}

interface LicenceStatusBadgeProps {
  status: LicenceStatus
  className?: string
}

export function LicenceStatusBadge({ status, className }: LicenceStatusBadgeProps) {
  const { label, className: statusClass } = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusClass,
        className
      )}
    >
      {label}
    </span>
  )
}
