import { sendAlertEmail } from '@/lib/email'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await sendAlertEmail({
      to: session.user.email,
      alertTitle: 'Test Alert — HireComply Email Working',
      alertDescription: 'This is a test email to confirm Resend is configured correctly.',
      daysUntil: 15,
      actionUrl: process.env.NEXT_PUBLIC_APP_URL + '/dashboard',
    })
    return Response.json({ success: true, sentTo: session.user.email, result })
  } catch (error) {
    return Response.json({ success: false, error: String(error) })
  }
}
