import { differenceInDays, format } from 'date-fns'
import {
  AlertType,
  AlertSeverity,
  ReportStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { STATE_AUTHORITIES } from '@/lib/compliance'
import { sendAlertEmail } from '@/lib/email'

const WORK_RIGHT_EXPIRY_THRESHOLD_DAYS = 90
const POLICE_CHECK_EXPIRY_THRESHOLD_DAYS = 60
const REPORT_DUE_THRESHOLD_DAYS = 60
const LICENCE_CRITICAL_THRESHOLD_DAYS = 7
const REPORT_CRITICAL_THRESHOLD_DAYS = 14

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')

async function notifyOrgOwnerForAlert({
  orgId,
  severity,
  alertTitle,
  alertDescription,
  daysUntil,
  actionPath,
}: {
  orgId: string
  severity: AlertSeverity
  alertTitle: string
  alertDescription: string
  daysUntil: number | null
  actionPath: '/licences' | '/workers' | '/reports'
}) {
  if (severity !== AlertSeverity.CRITICAL && severity !== AlertSeverity.WARNING) {
    return
  }

  try {
    const ownerMembership = await prisma.organizationMember.findFirst({
      where: { orgId, role: 'OWNER' },
      include: { user: true },
    })

    const ownerEmail = ownerMembership?.user?.email
    if (!ownerEmail) return

    const actionUrl = `${APP_URL}${actionPath}`

    await sendAlertEmail({
      to: ownerEmail,
      alertTitle,
      alertDescription,
      daysUntil,
      actionUrl,
    })
  } catch (error) {
    console.error('[ALERT EMAIL]', error)
  }
}

export async function generateAlertsForOrg(orgId: string): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize to start of day

  // ───────────────────────────
  // A) LICENCE ALERTS
  // ───────────────────────────
  const licences = await prisma.licenceRecord.findMany({
    where: { orgId },
  })

  for (const licence of licences) {
    const daysUntil = differenceInDays(licence.expiryDate, today)

    if (daysUntil <= WORK_RIGHT_EXPIRY_THRESHOLD_DAYS && daysUntil >= -30) {
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

      const existing = await prisma.complianceAlert.findFirst({
        where: {
          orgId,
          type: alertType,
          relatedId: licence.id,
          isDismissed: false,
          createdAt: { gte: today },
        },
      })

      if (existing) continue

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

      await notifyOrgOwnerForAlert({
        orgId,
        severity,
        alertTitle: title,
        alertDescription: description,
        daysUntil,
        actionPath: '/licences',
      })
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

      const existing = await prisma.complianceAlert.findFirst({
        where: {
          orgId,
          type: alertType,
          relatedId: worker.id,
          isDismissed: false,
          createdAt: { gte: today },
        },
      })

      if (existing) continue

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

      await notifyOrgOwnerForAlert({
        orgId,
        severity,
        alertTitle: title,
        alertDescription: description,
        daysUntil,
        actionPath: '/workers',
      })
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
      const alertType = AlertType.WORKER_POLICE_CHECK

      const existing = await prisma.complianceAlert.findFirst({
        where: {
          orgId,
          type: alertType,
          relatedId: worker.id,
          isDismissed: false,
          createdAt: { gte: today },
        },
      })

      if (existing) continue

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
          type: alertType,
          severity,
          title,
          description,
          daysUntil,
          relatedId: worker.id,
          relatedType: 'WORKER',
        },
      })

      await notifyOrgOwnerForAlert({
        orgId,
        severity,
        alertTitle: title,
        alertDescription: description,
        daysUntil,
        actionPath: '/workers',
      })
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
      const alertType = AlertType.REPORT_DUE

      const existing = await prisma.complianceAlert.findFirst({
        where: {
          orgId,
          type: alertType,
          relatedId: report.id,
          isDismissed: false,
          createdAt: { gte: today },
        },
      })

      if (existing) continue

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
          type: alertType,
          severity,
          title,
          description,
          daysUntil,
          relatedId: report.id,
          relatedType: 'REPORT',
        },
      })

      await notifyOrgOwnerForAlert({
        orgId,
        severity,
        alertTitle: title,
        alertDescription: description,
        daysUntil,
        actionPath: '/reports',
      })
    }
  }
}
