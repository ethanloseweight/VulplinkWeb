type ContactPayload = Record<string, string> & { kind: 'sales' | 'support' }

const jsonHeaders = { 'Content-Type': 'application/json' }

Deno.serve(async (request) => {
  if (request.method !== 'POST') return response({ message: 'Method not allowed.' }, 405)

  try {
    const body = await request.json() as ContactPayload
    if (!['sales', 'support'].includes(body.kind) || !body.name?.trim() || !/^\S+@\S+\.\S+$/.test(body.email || '')) {
      return response({ message: 'Invalid contact payload.' }, 400)
    }

    const sender = required('GMAIL_SENDER_EMAIL')
    const senderName = Deno.env.get('GMAIL_FROM_NAME') || 'Vulplink'
    const teamEmail = body.kind === 'sales'
      ? (Deno.env.get('SALES_EMAIL') || 'sales@vulplink.com')
      : (Deno.env.get('SUPPORT_EMAIL') || 'support@vulplink.com')
    const subject = body.kind === 'sales'
      ? `New Sales Enquiry — ${body.name}`
      : `New Support Request — ${body.name}`
    const details = Object.entries(body)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key.replaceAll('_', ' ').toUpperCase()}: ${String(value).trim()}`)
      .join('\n\n')

    const token = await getGmailAccessToken()
    await sendGmail(token, { from: sender, fromName: senderName, to: teamEmail, replyTo: body.email, subject, text: details })
    await sendGmail(token, {
      from: sender,
      fromName: senderName,
      to: body.email,
      replyTo: teamEmail,
      subject: body.kind === 'sales' ? 'We received your enquiry — Vulplink' : 'Support request received — Vulplink',
      text: `Hi ${body.name},\n\nThank you for contacting Vulplink. We have received your ${body.kind === 'sales' ? 'enquiry' : 'support request'} and our team will respond shortly.\n\nVulplink`,
    })

    return response({ ok: true })
  } catch (error) {
    console.error(error)
    return response({ message: error instanceof Error ? error.message : 'Unable to send email.' }, 500)
  }
})

async function getGmailAccessToken(): Promise<string> {
  const result = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: required('GMAIL_CLIENT_ID'),
      client_secret: required('GMAIL_CLIENT_SECRET'),
      refresh_token: required('GMAIL_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    }),
  })
  const data = await result.json() as { access_token?: string; error?: string; error_description?: string }
  if (!result.ok || !data.access_token) throw new Error(`Google OAuth token request failed: ${data.error_description || data.error || result.status}`)
  return data.access_token
}

async function sendGmail(token: string, mail: { from: string; fromName: string; to: string; replyTo: string; subject: string; text: string }) {
  const raw = [
    `From: ${displayName(mail.fromName)} <${safeHeader(mail.from)}>`,
    `To: ${safeHeader(mail.to)}`,
    `Reply-To: ${safeHeader(mail.replyTo)}`,
    `Subject: ${encodeHeader(mail.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(mail.text),
  ].join('\r\n')
  const result = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: base64Url(raw) }),
  })
  if (!result.ok) throw new Error(`Gmail API returned ${result.status}: ${await result.text()}`)
}

function required(name: string): string {
  const value = Deno.env.get(name)?.trim()
  if (!value) throw new Error(`${name} is not configured.`)
  return value
}

function safeHeader(value: string): string { return value.replace(/[\r\n]/g, '') }
function displayName(value: string): string { return encodeHeader(safeHeader(value)) }
function encodeHeader(value: string): string { return `=?UTF-8?B?${encodeBase64(value)}?=` }

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64Url(value: string): string {
  return encodeBase64(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders })
}
