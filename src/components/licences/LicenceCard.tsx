import { LicenceRecord, AustralianState } from '@prisma/client'
import { ExternalLink, FileText, AlertTriangle, Clock } from 'lucide-react'
import { STATE_AUTHORITIES } from '@/lib/compliance'
import {
  cn,
  formatAUDate,
  expiryLabel,
  daysUntilExpiry,
  calculateLicenceStatus,
} from '@/lib/utils'
import { LicenceStatusBadge } from './LicenceStatusBadge'
import { AddLicenceDialog } from './AddLicenceDialog'
import { EditLicenceDialog } from './EditLicenceDialog'

interface LicenceCardProps {
  licence: LicenceRecord | null
  state: AustralianState
}

// State emoji flags
const STATE_EMOJI: Partial<Record<AustralianState, string>> = {
  VIC: '🏛️',
  QLD: '⚡',
  SA: '🌅',
  ACT: '🏔️',
  WA: '🌊',
}

const BORDER_COLOUR: Record<string, string> = {
  ACTIVE:   'border-l-4 border-l-green-500',
  EXPIRING: 'border-l-4 border-l-amber-500',
  URGENT:   'border-l-4 border-l-red-500',
  EXPIRED:  'border-l-4 border-l-red-600',
  SUSPENDED:'border-l-4 border-l-red-600',
  PENDING:  'border-l-4 border-l-blue-500',
}

export function LicenceCard({ licence, state }: LicenceCardProps) {
  const authority = STATE_AUTHORITIES[state]
  const emoji = STATE_EMOJI[state] ?? '📋'

  // ─── WA Coming Soon card ─────────────────────────────────────
  if (state === 'WA') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-slate-300 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
              {emoji} Western Australia
            </p>
            <h3 className="font-semibold text-slate-700">{authority.shortName}</h3>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
            Coming Soon
          </span>
        </div>
        <p className="text-sm text-slate-500">{authority.name}</p>
        <p className="text-xs text-slate-400 mt-2 italic">
          Scheme not yet active — {authority.reportingFrequency}
        </p>
        {authority.portalUrl && (
          <a
            href={authority.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-3"
          >
            View portal <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    )
  }

  // ─── No licence registered ────────────────────────────────────
  if (!licence) {
    const isSA = state === 'SA'
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
              {emoji} {state}
            </p>
            <h3 className="font-semibold text-slate-700">{authority.shortName}</h3>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-1">{authority.name}</p>
        <p className="text-sm text-slate-400 mb-4">No licence registered</p>

        {isSA && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium">
              Grace period ends {authority.graceDate} — you must hold a licence to continue operating.
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <AddLicenceDialog defaultState={state as 'VIC' | 'QLD' | 'SA' | 'ACT'} triggerLabel="Register Licence" />
          {authority.portalUrl && (
            <a
              href={authority.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              {authority.shortName} portal <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    )
  }

  // ─── Licence exists ──────────────────────────────────────────
  const status = calculateLicenceStatus(new Date(licence.expiryDate))
  const days = daysUntilExpiry(new Date(licence.expiryDate))
  const borderClass = BORDER_COLOUR[status] ?? 'border-l-4 border-l-slate-300'
  const isUrgent = status === 'URGENT' || status === 'EXPIRED'

  // Progress bar: % of licence period elapsed
  let progressPercent = 0
  let progressColour = 'bg-green-500'
  if (licence.issuedDate) {
    const issued = new Date(licence.issuedDate).getTime()
    const expiry = new Date(licence.expiryDate).getTime()
    const now = Date.now()
    progressPercent = Math.min(100, Math.max(0, ((now - issued) / (expiry - issued)) * 100))
  }
  if (days <= 7) progressColour = 'bg-red-500'
  else if (days <= 30) progressColour = 'bg-amber-500'

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-6 shadow-sm', borderClass)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
            {emoji} {state}
          </p>
          <h3 className="font-semibold text-slate-900">{authority.shortName}</h3>
        </div>
        <LicenceStatusBadge status={status} />
      </div>

      {/* Licence number */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-0.5">Licence number</p>
        <p className={cn('text-sm font-medium', !licence.licenceNumber && 'text-slate-400 italic')}>
          {licence.licenceNumber ?? 'Not recorded'}
        </p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Issued</p>
          <p className="font-medium text-slate-700">
            {licence.issuedDate ? formatAUDate(licence.issuedDate) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Expires</p>
          <p className="font-medium text-slate-700">{formatAUDate(licence.expiryDate)}</p>
        </div>
      </div>

      {/* Days remaining */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className={cn('h-4 w-4', isUrgent ? 'text-red-500' : days <= 90 ? 'text-amber-500' : 'text-green-500')} />
        <span className={cn(
          'text-sm font-medium',
          isUrgent ? 'text-red-600' : days <= 90 ? 'text-amber-700' : 'text-green-700'
        )}>
          {expiryLabel(new Date(licence.expiryDate))}
        </span>
      </div>

      {/* Progress bar */}
      {licence.issuedDate && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Licence period used</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={cn('h-1.5 rounded-full transition-all', progressColour)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Authority link */}
      {authority.portalUrl && (
        <a
          href={authority.portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mb-4"
        >
          View {authority.shortName} portal <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <EditLicenceDialog licence={licence} />
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50 transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          Documents
        </button>
      </div>

      {/* Warning banner */}
      {isUrgent && (
        <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 font-medium">
            ⚠️ Action required — renew via{' '}
            <a
              href={authority.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {authority.name}
            </a>{' '}
            portal
          </p>
        </div>
      )}
    </div>
  )
}
