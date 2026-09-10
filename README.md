# Vulplink — one Cloudflare Worker + Supabase

This repository migrates the supplied `vulplink-v2` WordPress theme to one Cloudflare Worker while preserving the public visual system and product functionality.

## URLs

- `/` — public website home
- `/product` — product catalogue
- `/product/:slug` — product detail
- `/contact` — contact page
- `/admin` — separate, lazy-loaded administration application
- `POST /contact/submit` — internal form endpoint handled by the Worker

There is no public `/api` route. The website, admin application and form endpoint are deployed as one Worker.

## Architecture

- **Cloudflare Worker:** serves the compiled website assets and handles form submissions
- **Supabase Database:** products, categories, settings and enquiry records
- **Supabase Auth:** admin login
- **Supabase Storage:** product and gallery images
- **Supabase Edge Function:** sends team notifications and visitor confirmations
- **Resend:** actual email delivery provider used by the Supabase Edge Function

Supabase does not provide a general-purpose business email mailbox/API by itself. Its Edge Function runs the email logic; a delivery provider such as Resend is still required. This follows Supabase's official email-function pattern.

## 1. Create Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial.sql` in SQL Editor.
3. Create the first user in Authentication → Users.
4. Add that user's UUID to the admin allowlist:

   ```sql
   insert into public.admin_users(user_id) values ('USER-UUID-HERE');
   ```

5. Deploy the email function:

   ```bash
   supabase functions deploy send-contact-email
   ```

6. Add its secrets:

   ```bash
   supabase secrets set RESEND_API_KEY="..." CONTACT_FROM_EMAIL="Vulplink <website@your-domain.com>" SALES_EMAIL="sales@vulplink.com" SUPPORT_EMAIL="support@vulplink.com"
   ```

## 2. Environment variables

Create `.env` for local development using `.env.example`.

Public build variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Cloudflare Worker secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_EMAIL_FUNCTION` (optional; defaults to `send-contact-email`)

Set Worker secrets with `wrangler secret put`. Never expose the service-role key as a `VITE_` variable.

## 3. Move WordPress products and media references

The supplied ZIP contains the theme only; the live products and WordPress Media Library are not inside it. On the existing WordPress server:

```bash
wp eval-file scripts/export-wordpress.php > vulplink-export.json
```

Then import:

```bash
SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." node scripts/import-to-supabase.mjs vulplink-export.json
```

This preserves categories, products, tags, models, highlights, ordered specification rows, image URLs, publish state and slideshow/contact settings.

## 4. Develop and deploy

```bash
npm ci
npm run cf:dev
npm run cf:deploy
```

The Worker uses Cloudflare Static Assets with SPA fallback. Only `/contact/submit` runs Worker logic first; normal website and admin requests are served directly from edge assets.

## GitHub deployment

`.github/workflows/deploy.yml` can deploy every push to `main` after these GitHub Actions secrets are configured:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The three Worker secrets above must also be configured in Cloudflare.
