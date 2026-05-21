'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { AlertSeverity, ComplianceAlert } from '@prisma/client'
import { AlertTriangle, Info, BellRing, CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import * as React from 'react'

type FilterType = 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'

interface AlertsClientPageProps {
  initialAlerts: ComplianceAlert[]
  orgId: string
}

const AlertIcon: Record<AlertSeverity, React.ReactNode> = {
  CRITICAL: <AlertTriangle className="h-5 w-5 text-red-500" />,
  WARNING: <BellRing className="h-5 w-5 text-amber-500" />,
  INFO: <Info className="h-5 w-5 text-blue-500" />,
}

const AlertBorderColor: Record<AlertSeverity, string> = {
  CRITICAL: 'border-red-500',
  WARNING: 'border-amber-500',
  INFO: 'border-blue-500',
}

export function AlertsClientPage({ initialAlerts, orgId }: AlertsClientPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<ComplianceAlert[]>(initialAlerts)
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [isGenerating, setIsGenerating] = useState(false)

  // Update alerts if initialAlerts prop changes (e.g., after a refresh)
  useEffect(() => {
    setAlerts(initialAlerts)
  }, [initialAlerts])

  const filteredAlerts = useMemo(() => {
    if (filter === 'ALL') return alerts.filter((alert) => !alert.isRead)
    return alerts.filter((alert) => alert.severity === filter && !alert.isRead)
  }, [alerts, filter])

  const handleRunCheck = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/alerts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }), // Pass orgId if needed by API
      })
      if (!res.ok) {
        throw new Error('Failed to generate alerts')
      }
      // Re-fetch alerts to update the list
      router.refresh()
      toast({
        title: 'Compliance check complete',
        description: 'New alerts have been generated and the list updated.',
      })
    } catch (error) {
      console.error('Error generating alerts:', error)
      toast({
        title: 'Failed to run check',
        description: 'There was an error generating alerts. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMarkAsRead = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      if (!res.ok) {
        throw new Error('Failed to mark alert as read')
      }
      setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert)))
      toast({
        title: 'Alert marked as read',
        description: 'This alert will no longer appear in your active list.',
      })
    } catch (error) {
      console.error('Error marking alert as read:', error)
      toast({
        title: 'Failed to mark as read',
        description: 'There was an error. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDismiss = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDismissed: true }),
      })
      if (!res.ok) {
        throw new Error('Failed to dismiss alert')
      }
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === alertId ? { ...alert, isDismissed: true } : alert))
      )
      toast({
        title: 'Alert dismissed',
        description: 'This alert has been dismissed and will not reappear.',
      })
    } catch (error) {
      console.error('Error dismissing alert:', error)
      toast({
        title: 'Failed to dismiss',
        description: 'There was an error. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Compliance Alerts</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review and manage compliance issues across your organisation.
          </p>
        </div>
        <Button onClick={handleRunCheck} disabled={isGenerating}>
          {isGenerating ? 'Running check...' : 'Run Check Now'}
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="CRITICAL">Critical</TabsTrigger>
          <TabsTrigger value="WARNING">Warnings</TabsTrigger>
          <TabsTrigger value="INFO">Info</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredAlerts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-4 text-lg font-medium">No active alerts</p>
          <p className="mt-2 text-sm">Run a compliance check to scan for issues.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'relative rounded-xl border-l-4 bg-white p-4 shadow-sm',
                AlertBorderColor[alert.severity]
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">{AlertIcon[alert.severity]}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{alert.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{alert.description}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {alert.daysUntil !== null && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-medium',
                          alert.daysUntil < 0
                            ? 'bg-red-100 text-red-700'
                            : alert.daysUntil <= 30
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {alert.daysUntil < 0
                          ? `${Math.abs(alert.daysUntil)} days overdue`
                          : `${alert.daysUntil} days until expiry`}
                      </span>
                    )}
                    <span>Created {formatDistanceToNow(new Date(alert.createdAt))} ago</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(alert.id)}>
                      Mark as read
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDismiss(alert.id)}>
                      Dismiss
                    </Button>
                    {alert.relatedType === 'LICENCE' && alert.relatedId && (
                      <Button variant="link" size="sm">
                        <Link href={`/licences?id=${alert.relatedId}`}>View Licence &rarr;</Link>
                      </Button>
                    )}
                    {alert.relatedType === 'WORKER' && alert.relatedId && (
                      <Button variant="link" size="sm">
                        <Link href={`/workers?id=${alert.relatedId}`}>View Worker &rarr;</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
