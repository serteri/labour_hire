import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { z } from 'zod'

const waitlistSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = waitlistSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid input.' }, { status: 400 })
    }
    const { name, company, email, phone } = parsed.data

    // Save to database — if email already exists, return a friendly message
    try {
      await prisma.waitlistEntry.create({ data: { name, company, email, phone } })
    } catch (err: unknown) {
      // Prisma unique constraint violation code
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        return Response.json({ error: 'This email is already on the waitlist.' }, { status: 409 })
      }
      throw err
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromAddress = `${process.env.RESEND_FROM_NAME ?? 'HireComply'} <${process.env.RESEND_FROM_EMAIL}>`
    const timestamp = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })

    // Notify us
    await resend.emails.send({
      from: fromAddress,
      to: 'support@providershield.com.au',
      subject: '🎯 New Waitlist Signup — Host Employer Plan',
      html: `
        <h2>New Waitlist Entry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone ?? 'Not provided'}</p>
        <p><strong>Signed up:</strong> ${timestamp}</p>
        <hr/>
        <p><a href="https://labour-hire-five.vercel.app">View HireComply</a></p>
      `,
    })

    // Confirm to the person
    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: "You're on the HireComply waitlist",
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
          <h2>You're on the list, ${name}!</h2>
          <p>Thanks for your interest in HireComply's Host Employer plan.</p>
          <p>We're building the host verification portal now and will contact you personally at
          <strong>${email}</strong> before public launch.</p>
          <p>Expected availability: Q3 2026.</p>
          <p>In the meantime, if you have any questions reply to this email.</p>
          <hr/>
          <p style="font-size: 13px; color: #888;">
            HireComply — Labour Hire Compliance Platform<br/>
            Brisbane, Australia
          </p>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('[WAITLIST] Error:', err)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
