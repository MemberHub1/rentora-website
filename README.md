# COLORA PAINTS

Responsive paint-company website built with React, Vite, React Router, Tailwind CSS, Lucide and Supabase.

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the Supabase project’s API settings.
4. Run `npm run dev`.

The publishable/anon key is expected to be public. Never put a Supabase service-role key or other secret in a `VITE_` variable or frontend file. Without both environment variables, public catalog pages use clearly labelled sample data, enquiry submission is disabled, and the admin is unavailable. The fallback does not write or cache content in local storage.

## Supabase project setup

1. Run [`supabase/colora_schema.sql`](./supabase/colora_schema.sql) in the Supabase SQL editor. It creates/upgrades the COLORA tables, seeds the starter catalog/settings, applies row-level security and creates the image bucket/policies. Run it separately from the retained legacy schema.
2. In Supabase Auth, create an administrator using the dashboard or a trusted server-side invite process. Public sign-up is not implemented in this frontend. Do not add credentials to source control.
3. Copy that Auth user’s UUID and add it to the allow-list from the SQL editor:

   ```sql
   insert into public.admin_users (user_id)
   values ('AUTH_USER_UUID');
   ```

   To revoke access, delete that user’s row from `public.admin_users`. Auth alone is insufficient: the website also checks the allow-list, and database RLS independently checks it on every admin operation.
4. In Supabase Storage, verify the SQL-created `website-images` bucket is public for reads (published website imagery) and that upload, update and delete are limited to authorized admins. Review existing Storage policies in the project: PostgreSQL policies are permissive by default, so remove any unrelated broad policy that also grants writes to this bucket.
5. Configure the frontend environment, deploy, and complete the project-backed acceptance tests before production launch.

## Data and security

The UI uses the async adapter in `src/lib/catalogRepository.js`; database rows are mapped to the existing camel-case UI records there. Product, color, category and article reads filter to `published = true`; admin loads include drafts only after authenticated allow-list verification. Enquiries are insertable by the public form and readable/updatable/deletable only by authorized admins. Site settings are publicly readable and admin-managed. Images are uploaded to `website-images` and only their URLs are stored in table rows.

Admin sign-in uses Supabase email/password Auth. No sign-up, automatic admin provisioning, passwords or service-role credentials are present in the browser code. In addition to UI authorization, RLS and table privileges enforce access. The schema grants anonymous users only the public reads and limited enquiry insert fields; all content mutation policies require an Auth user in `public.admin_users`.

## Routes

- `/` — home, collections, color introduction, paint estimate, visualizer preview
- `/products`, `/products/:id` — search/filter catalog and product detail
- `/colors`, `/colors/:id` — color search, family filters and details
- `/calculator`, `/about`, `/contact`
- `/admin` — authenticated content management
- `/privacy-policy`, `/terms`

## Validation

Run `npm run build`, `npm run lint` and `git diff --check`. Real authentication, RLS, Storage and persisted CRUD acceptance testing requires a configured Supabase project and an administrator account.

## Before launch

Replace placeholder company contact details and starter business metrics, verify every product claim and image licence, provide approved privacy/terms copy, and review Supabase project Auth, API exposure, backup, abuse/rate limiting and existing Storage policies. The room color visualizer is an experimental local overlay only; it does not identify room walls or predict a true paint match. No payment processing is implemented.
