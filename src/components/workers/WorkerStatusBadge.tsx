import { WorkRightStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<WorkRightStatus, { label: string; className: string }> = {
  VALID: {
    label: 'Work Rights Valid',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  EXPIRING: {
    label: 'Expiring Soon',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  RESTRICTED: {
    label: 'Restricted',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  UNKNOWN: {
    label: 'Unknown',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
}

interface WorkerStatusBadgeProps {
  status: WorkRightStatus
  className?: string
}

export function WorkerStatusBadge({ status, className }: WorkerStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
