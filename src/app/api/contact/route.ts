import { Resend } from 'resend'

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json()

  if (!name || !email || !subject || !message) {
    return Response.json({ error: 'All fields required' }, { status: 400 })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: `HireComply <${process.env.RESEND_FROM_EMAIL}>`,
      to: 'support@providershield.com.au',
      replyTo: email,
      subject: `[HireComply Contact] ${subject}`,
      html: `
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Failed to send' }, { status: 500 })
  }
}
