# Green Zone Academy Deployment

This project is ready to run on Vercel Hobby with Supabase Free. You do not need a custom paid backend, local PostgreSQL, or Docker.

## Fastest Production Path

Use:

```txt
Frontend: Vercel Hobby
Backend/data: Supabase Free
Domain: greenzone-academy.tech
```

The existing Express server remains in the repo but is not part of this free deployment path.

## Supabase Setup

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.generated.sql`.
5. Create the first admin account through the app or Supabase Auth.
6. Run `supabase/admin-bootstrap.sql` after replacing the email if needed.

To regenerate the seed from current frontend content:

```bash
npm run supabase:seed:generate
```

## Vercel Environment

Set these variables in Vercel:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never put a Supabase service role key in Vercel frontend environment variables.

## Frontend Build Command

Use:

```bash
npm install
npm run build
```

Publish the generated `dist` folder.

## Domain Setup

Add `greenzone-academy.tech` in Vercel project domains, then copy the DNS records Vercel gives you into get.tech DNS.

Typical Vercel DNS shape:

```txt
Host: @
Type: A
Value: 76.76.21.21

Host: www
Type: CNAME
Value: cname.vercel-dns.com
```

Use the exact values shown by Vercel if they differ.

## Smoke Test

After deploy:

1. Open `/admin`.
2. Login as the promoted admin.
3. Open `/admin/students`.
4. Disable or enable a student, refresh, and confirm it persists in Supabase.
5. Open `/admin/audit-log` and confirm the action was recorded.
6. Open Lesson 1 and Lesson 2 in English and Arabic.
7. Complete a lesson and confirm `student_progress` gets a row.
8. Save a lesson note and confirm `lesson_notes` gets a row.
