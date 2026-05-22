import { Resend } from 'resend'

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendAlertEmail({
  to,
  alertTitle,
  alertDescription,
  daysUntil,
  actionUrl,
}: {
  to: string
  alertTitle: string
  alertDescription: string
  daysUntil: number | null
  actionUrl: string
}) {
  const resend = getResendClient()
  if (!resend) return

  await resend.emails.send({
    from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
    to,
    subject: `⚠️ HireComply: ${alertTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">HireComply</h1>
          <p style="color: #94a3b8; margin: 4px 0 0;">Labour Hire Compliance Alert</p>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #0f172a; margin: 0 0 12px;">${alertTitle}</h2>
          <p style="color: #475569; margin: 0 0 16px;">${alertDescription}</p>
          ${daysUntil !== null ? `
            <div style="background: ${daysUntil <= 7 ? '#fef2f2' : daysUntil <= 30 ? '#fff7ed' : '#fefce8'}; 
                        border: 1px solid ${daysUntil <= 7 ? '#fecaca' : daysUntil <= 30 ? '#fed7aa' : '#fef08a'}; 
                        border-radius: 6px; padding: 12px 16px; margin-bottom: 20px;">
              <strong style="color: ${daysUntil <= 7 ? '#dc2626' : daysUntil <= 30 ? '#ea580c' : '#ca8a04'};">
                ${daysUntil <= 0 ? 'EXPIRED' : `${daysUntil} days remaining`}
              </strong>
            </div>
          ` : ''}
          <a href="${actionUrl}" 
             style="display: inline-block; background: #2563eb; color: white; 
                    padding: 12px 24px; border-radius: 6px; text-decoration: none; 
                    font-weight: 500;">
            View in HireComply →
          </a>
        </div>
        <div style="background: #f8fafc; padding: 16px 24px; border: 1px solid #e2e8f0; 
                    border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            You're receiving this because you have a HireComply account. 
            Log in to manage your alerts.
          </p>
        </div>
      </div>
    `,
  })
}
