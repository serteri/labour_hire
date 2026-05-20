import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, isAfter, isBefore } from 'date-fns'
import { LicenceStatus } from '@prisma/client'

// Tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate licence status from expiry date
export function calculateLicenceStatus(expiryDate: Date): LicenceStatus {
  const today = new Date()
  const daysRemaining = differenceInDays(expiryDate, today)

  if (isBefore(expiryDate, today)) return 'EXPIRED'
  if (daysRemaining <= 30) return 'URGENT'
  if (daysRemaining <= 90) return 'EXPIRING'
  return 'ACTIVE'
}

// Format date for Australian display (DD/MM/YYYY)
export function formatAUDate(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy')
}

// Days until expiry (can be negative if expired)
export function daysUntilExpiry(expiryDate: Date): number {
  return differenceInDays(new Date(expiryDate), new Date())
}

// Human-readable expiry string
export function expiryLabel(expiryDate: Date): string {
  const days = daysUntilExpiry(expiryDate)
  if (days < 0) return `Expired ${Math.abs(days)} days ago`
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  if (days <= 30) return `Expires in ${days} days`
  if (days <= 90) return `Expires in ${days} days`
  return `Expires ${formatAUDate(expiryDate)}`
}

// Colour classes for status badges
export function statusColour(status: LicenceStatus): string {
  const map: Record<LicenceStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    EXPIRING: 'bg-yellow-100 text-yellow-800',
    URGENT: 'bg-orange-100 text-orange-800',
    EXPIRED: 'bg-red-100 text-red-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    PENDING: 'bg-blue-100 text-blue-800',
  }
  return map[status]
}
