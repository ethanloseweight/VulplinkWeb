type ContactPayload = Record<string, string> & { kind: 'sales' | 'support' }

Deno.serve(async (request) => {
  if (request.method !== 'POST') return response({ message: 'Method not allowed.' }, 405)

  try {
    const body = await request.json() as ContactPayload
    if (!['sales', 'support'].includes(body.kind) || !body.name || !body.email) {
      return response({ message: 'Invalid contact payload.' }, 400)
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('RESEND_API_KEY is not configured.')

    const from = Deno.env.get('CONTACT_FROM_EMAIL') || 'Vulplink <website@vulplink.com>'
    const teamEmail = body.kind === 'sales'
      ? (Deno.env.get('SALES_EMAIL') || 'sales@vulplink.com')
      : (Deno.env.get('SUPPORT_EMAIL') || 'support@vulplink.com')
    const subject = body.kind === 'sales'
      ? `New Sales Enquiry — ${body.name}`
      : `New Support Request — ${body.name}`
    const details = Object.entries(body)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key.replaceAll('_', ' ').toUpperCase()}: ${value}`)
      .join('\n\n')

    await send(resendKey, {
      from,
      to: [teamEmail],
      reply_to: body.email,
      subject,
      text: details,
    })

    await send(resendKey, {
      from,
      to: [body.email],
      subject: body.kind === 'sales' ? 'We received your enquiry — Vulplink' : 'Support request received — Vulplink',
      text: `Hi ${body.name},\n\nThank you for contacting Vulplink. We have received your ${body.kind === 'sales' ? 'enquiry' : 'support request'} and our team will respond shortly.\n\nVulplink`,
    })

    return response({ ok: true })
  } catch (error) {
    console.error(error)
    return response({ message: error instanceof Error ? error.message : 'Unable to send email.' }, 500)
  }
})

async function send(apiKey: string, payload: unknown) {
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!result.ok) throw new Error(`Email provider returned ${result.status}: ${await result.text()}`)
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}
