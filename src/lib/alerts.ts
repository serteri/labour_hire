import { differenceInDays, format } from 'date-fns'
import {
  AlertType,
  AlertSeverity,
  ReportStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { STATE_AUTHORITIES } from '@/lib/compliance'

const WORK_RIGHT_EXPIRY_THRESHOLD_DAYS = 90
const POLICE_CHECK_EXPIRY_THRESHOLD_DAYS = 60
const REPORT_DUE_THRESHOLD_DAYS = 60
const LICENCE_CRITICAL_THRESHOLD_DAYS = 7
const REPORT_CRITICAL_THRESHOLD_DAYS = 14

export async function generateAlertsForOrg(orgId: string): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize to start of day

  // Fetch existing unresolved alerts for deduplication
  const existingAlerts = await prisma.complianceAlert.findMany({
    where: {
      orgId,
      isDismissed: false,
      resolvedAt: null,
      createdAt: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()), // Alerts created today
      },
    },
    select: {
      type: true,
      relatedId: true,
      relatedType: true,
      createdAt: true,
    },
  })

  // ───────────────────────────
  // A) LICENCE ALERTS
  // ───────────────────────────
  const licences = await prisma.licenceRecord.findMany({
    where: { orgId },
  })

  for (const licence of licences) {
    const daysUntil = differenceInDays(licence.expiryDate, today)

    if (daysUntil <= WORK_RIGHT_EXPIRY_THRESHOLD_DAYS && daysUntil >= -30) {
      const existing = existingAlerts.find(
        (alert) =>
          alert.type === AlertType.LICENCE_EXPIRY &&
          alert.relatedId === licence.id &&
          alert.relatedType === 'LICENCE'
      )

      if (!existing) {
        let severity: AlertSeverity
        let alertType: AlertType
        let title: string
        let description: string

        if (daysUntil < 0) {
          severity = AlertSeverity.CRITICAL
          alertType = AlertType.LICENCE_EXPIRED
          title = `${licence.state} Licence EXPIRED ${Math.abs(daysUntil)} days ago`
        } else if (daysUntil <= LICENCE_CRITICAL_THRESHOLD_DAYS) {
          severity = AlertSeverity.CRITICAL
          alertType = AlertType.LICENCE_EXPIRY
          title = `${licence.state} Licence expiring in ${daysUntil} days`
        } else if (daysUntil <= WORK_RIGHT_EXPIRY_THRESHOLD_DAYS) {
          severity = AlertSeverity.WARNING
          alertType = AlertType.LICENCE_EXPIRY
          title = `${licence.state} Licence expiring in ${daysUntil} days`
        } else {
          severity = AlertSeverity.INFO
          alertType = AlertType.LICENCE_EXPIRY
          title = `${licence.state} Licence expiry upcoming in ${daysUntil} days`
        }

        const authority = STATE_AUTHORITIES[licence.state]
        const portalLink = authority?.portalUrl ? ` Renew via ${authority.name} portal: ${authority.portalUrl}.` : ''
        description = `Your ${licence.state} Labour Hire Licence (${
          licence.licenceNumber || 'N/A'
        }) expires on ${format(licence.expiryDate, 'dd/MM/yyyy')}.` + portalLink

        await prisma.complianceAlert.create({
          data: {
            orgId,
            type: alertType,
            severity,
            title,
            description,
            daysUntil,
            relatedId: licence.id,
            relatedType: 'LICENCE',
          },
        })
      }
    }
  }

  // ───────────────────────────
  // B) WORKER VISA ALERTS
  // ───────────────────────────
  const workers = await prisma.workerRecord.findMany({
    where: { orgId, isActive: true, visaExpiryDate: { not: null } },
  })

  for (const worker of workers) {
    if (!worker.visaExpiryDate) continue

    const daysUntil = differenceInDays(worker.visaExpiryDate, today)

    if (daysUntil <= WORK_RIGHT_EXPIRY_THRESHOLD_DAYS && daysUntil >= -30) {
      const existing = existingAlerts.find(
        (alert) =>
          alert.type === AlertType.WORKER_VISA_EXPIRY &&
          alert.relatedId === worker.id &&
          alert.relatedType === 'WORKER'
      )

      if (!existing) {
        let severity: AlertSeverity
        let alertType: AlertType
        let title: string
        let description: string

        if (daysUntil < 0) {
          severity = AlertSeverity.CRITICAL
          alertType = AlertType.WORKER_VISA_EXPIRY
          title = `${worker.firstName} ${worker.lastName} — visa EXPIRED ${Math.abs(daysUntil)} days ago`
        } else if (daysUntil <= LICENCE_CRITICAL_THRESHOLD_DAYS) {
          severity = AlertSeverity.CRITICAL
          alertType = AlertType.WORKER_VISA_EXPIRY
          title = `${worker.firstName} ${worker.lastName} — visa expiring in ${daysUntil} days`
        } else if (daysUntil <= WORK_RIGHT_EXPIRY_THRESHOLD_DAYS) {
          severity = AlertSeverity.WARNING
          alertType = AlertType.WORKER_VISA_EXPIRY
          title = `${worker.firstName} ${worker.lastName} — visa expiring in ${daysUntil} days`
        } else {
          severity = AlertSeverity.INFO
          alertType = AlertType.WORKER_VISA_EXPIRY
          title = `${worker.firstName} ${worker.lastName} — visa expiry upcoming in ${daysUntil} days`
        }

        description = `${worker.visaType || 'Visa'} expires on ${format(
          worker.visaExpiryDate,
          'dd/MM/yyyy'
        )}. Ensure renewal or transition is in progress.`

        await prisma.complianceAlert.create({
          data: {
            orgId,
            type: alertType,
            severity,
            title,
            description,
            daysUntil,
            relatedId: worker.id,
            relatedType: 'WORKER',
          },
        })
      }
    }
  }

  // ───────────────────────────
  // C) POLICE CHECK ALERTS
  // ───────────────────────────
  const policeCheckWorkers = await prisma.workerRecord.findMany({
    where: { orgId, isActive: true, policeCheckExpiry: { not: null } },
  })

  for (const worker of policeCheckWorkers) {
    if (!worker.policeCheckExpiry) continue

    const daysUntil = differenceInDays(worker.policeCheckExpiry, today)

    if (daysUntil <= POLICE_CHECK_EXPIRY_THRESHOLD_DAYS && daysUntil >= -30) {
      const existing = existingAlerts.find(
        (alert) =>
          alert.type === AlertType.WORKER_POLICE_CHECK &&
          alert.relatedId === worker.id &&
          alert.relatedType === 'WORKER'
      )

      if (!existing) {
        let severity: AlertSeverity
        let title: string

        if (daysUntil < 0) {
          severity = AlertSeverity.CRITICAL
          title = `${worker.firstName} ${worker.lastName} — police check EXPIRED ${Math.abs(daysUntil)} days ago`
        } else if (daysUntil <= LICENCE_CRITICAL_THRESHOLD_DAYS) {
          severity = AlertSeverity.CRITICAL
          title = `${worker.firstName} ${worker.lastName} — police check expiring in ${daysUntil} days`
        } else {
          severity = AlertSeverity.WARNING
          title = `${worker.firstName} ${worker.lastName} — police check expiring in ${daysUntil} days`
        }

        const description = `Police check expires on ${format(
          worker.policeCheckExpiry,
          'dd/MM/yyyy'
        )}. Request an updated police check.`

        await prisma.complianceAlert.create({
          data: {
            orgId,
            type: AlertType.WORKER_POLICE_CHECK,
            severity,
            title,
            description,
            daysUntil,
            relatedId: worker.id,
            relatedType: 'WORKER',
          },
        })
      }
    }
  }

  // ───────────────────────────
  // D) REPORTING DUE ALERTS
  // ───────────────────────────
  const reports = await prisma.reportRecord.findMany({
    where: { orgId, status: { not: ReportStatus.SUBMITTED } },
  })

  for (const report of reports) {
    const daysUntil = differenceInDays(report.dueDate, today)

    if (daysUntil <= REPORT_DUE_THRESHOLD_DAYS && daysUntil >= -30) {
      const existing = existingAlerts.find(
        (alert) =>
          alert.type === AlertType.REPORT_DUE &&
          alert.relatedId === report.id &&
          alert.relatedType === 'REPORT'
      )

      if (!existing) {
        let severity: AlertSeverity
        let title: string

        if (daysUntil < 0) {
          severity = AlertSeverity.CRITICAL
          title = `${report.state} ${report.period} Report OVERDUE by ${Math.abs(daysUntil)} days`
        } else if (daysUntil <= REPORT_CRITICAL_THRESHOLD_DAYS) {
          severity = AlertSeverity.CRITICAL
          title = `${report.state} ${report.period} Report due in ${daysUntil} days`
        } else {
          severity = AlertSeverity.WARNING
          title = `${report.state} ${report.period} Report due in ${daysUntil} days`
        }

        const description = `The ${report.state} ${report.period} labour hire report is due on ${format(
          report.dueDate,
          'dd/MM/yyyy'
        )}. Please submit via the state authority portal.`

        await prisma.complianceAlert.create({
          data: {
            orgId,
            type: AlertType.REPORT_DUE,
            severity,
            title,
            description,
            daysUntil,
            relatedId: report.id,
            relatedType: 'REPORT',
          },
        })
      }
    }
  }
}
