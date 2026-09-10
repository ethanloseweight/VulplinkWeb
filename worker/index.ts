export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  SUPABASE_URL: string
  /** Public browser key. Safe to expose to the website; never use the service-role key here. */
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_EMAIL_FUNCTION?: string
}

type ContactPayload = Record<string, string> & { kind: 'sales' | 'support' }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/contact/submit') {
      if (request.method !== 'POST') return json({ message: 'Method not allowed.' }, 405)
      return handleContact(request, env)
    }

    const asset = await env.ASSETS.fetch(request)
    return injectPublicConfig(asset, env)
  },
}

/**
 * Vite's import.meta.env values are fixed at build time. Injecting the public
 * Supabase settings at the edge lets the GitHub build stay free of .env files
 * while keeping the values managed in Cloudflare Worker variables.
 */
async function injectPublicConfig(response: Response, env: Env): Promise<Response> {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html') || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return response

  const html = await response.text()
  const config = JSON.stringify({ url: env.SUPABASE_URL, anonKey: env.SUPABASE_ANON_KEY })
  const script = `<script>window.__VULPLINK_CONFIG__=${config};</script>`
  const output = html.replace('</head>', `${script}</head>`)
  const headers = new Headers(response.headers)
  headers.set('content-length', String(new TextEncoder().encode(output).byteLength))
  return new Response(output, { status: response.status, statusText: response.statusText, headers })
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  try {
    const origin = request.headers.get('Origin')
    if (origin && origin !== new URL(request.url).origin) return json({ message: 'Invalid request origin.' }, 403)

    const body = await request.json<ContactPayload>()
    if (!['sales', 'support'].includes(body.kind) || !body.name?.trim() || !/^\S+@\S+\.\S+$/.test(body.email || '')) {
      return json({ message: 'Please enter your name and a valid email address.' }, 400)
    }

    const clean = Object.fromEntries(Object.entries(body).map(([key, value]) => [
      key,
      String(value || '').trim().slice(0, key === 'message' ? 5000 : 300),
    ])) as ContactPayload

    const insert = await fetch(`${env.SUPABASE_URL}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        kind: clean.kind,
        name: clean.name,
        email: clean.email,
        company: clean.company || null,
        product: clean.product || null,
        order_number: clean.order_number || null,
        issue_type: clean.issue_type || null,
        message: clean.message || '',
      }),
    })
    if (!insert.ok) throw new Error(`Submission insert failed: ${insert.status}`)

    const functionName = env.SUPABASE_EMAIL_FUNCTION || 'send-contact-email'
    const email = await fetch(`${env.SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clean),
    })
    if (!email.ok) {
      const details = await email.text()
      console.error('Supabase email function failed', email.status, details)
      return json({ message: 'Your request was received, but the confirmation email could not be sent. Our team can still see your enquiry.' }, 202)
    }

    return json({
      message: clean.kind === 'sales'
        ? 'Thank you! Your enquiry has been sent. We will reply shortly.'
        : 'Your support request has been submitted. We will respond within 24 business hours.',
    })
  } catch (error) {
    console.error(error)
    return json({ message: 'Unable to send your message right now. Please try again.' }, 500)
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
