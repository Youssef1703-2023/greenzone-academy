# Green Zone Academy Deployment

This project is ready to run with a hosted PostgreSQL database. You do not need local PostgreSQL or Docker.

## Fastest Production Path

The repo includes `render.yaml`, so you can deploy it as a Render Blueprint:

1. Push the project to GitHub.
2. In Render, choose **New Blueprint**.
3. Select this repository.
4. Render will create:
   - `greenzone-academy-api`
   - `greenzone-academy-web`
   - `greenzone-academy-db`
5. After the first deploy, run the seed once:

```bash
npm run seed --prefix server
```

If you use another host, keep the same environment variables and commands below.

## Backend Environment

Set these variables in your backend hosting provider:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
PORT=5000
CLIENT_URL=https://your-domain.com
NODE_ENV=production
TRANSLATION_PROVIDER=libretranslate
LIBRETRANSLATE_URL=
LIBRETRANSLATE_API_KEY=
GOOGLE_TRANSLATE_API_KEY=
GOOGLE_TRANSLATE_PROJECT_ID=
```

Use your hosted PostgreSQL connection string for `DATABASE_URL`.

## Frontend Environment

Set this variable in your frontend hosting provider:

```env
VITE_API_URL=https://api.your-domain.com/api
```

If the backend is hosted under the same domain, point this to that backend API path.

## Backend Build Command

Use:

```bash
npm install
npm run deploy:prepare --prefix server
```

This runs:

1. Prisma client generation
2. Production database migrations
3. TypeScript backend build

## Backend Start Command

Use:

```bash
npm run start --prefix server
```

## Frontend Build Command

Use:

```bash
npm install
npm run build
```

Publish the generated `dist` folder.

## First Seed

Run this once after the production database has been migrated:

```bash
npm run seed --prefix server
```

The seed creates the initial Green Zone Academy course, Phase 1, Lesson 1, Lesson 2, Arabic translations, initial users, quiz records, admin settings, and an audit entry.

Do not run the seed repeatedly unless you intentionally want to refresh seeded records.

## Admin Backend

The admin panel uses backend APIs only. It does not use demo mode or browser-only localStorage overlays for admin data.

Important endpoints:

```txt
GET /api/admin/overview
GET /api/admin/health
GET /api/admin/courses
GET /api/admin/phases
GET /api/admin/lessons
GET /api/admin/quizzes
GET /api/admin/students
GET /api/admin/scores
GET /api/admin/translations
GET /api/admin/audit-log
GET /api/admin/settings
```

## Domain Setup

Recommended production shape:

```txt
https://your-domain.com        -> frontend
https://api.your-domain.com    -> backend
```

Then set:

```env
CLIENT_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com/api
```

For your domain:

```txt
https://greenzone-academy.tech      -> frontend
https://api.greenzone-academy.tech  -> backend
```

Add the custom domains in your hosting provider first. Then copy the DNS records it gives you into the get.tech DNS page.

Typical DNS shape:

```txt
Host: @
Type: A / ALIAS / ANAME
Value: frontend target from hosting provider

Host: www
Type: CNAME
Value: frontend target from hosting provider

Host: api
Type: CNAME
Value: backend target from hosting provider
```

Do not guess DNS target values. Use the exact values shown by your hosting provider after adding the custom domains.

## Smoke Test

After deploy:

1. Open `/admin`.
2. Confirm the demo warning is gone.
3. Open `/admin/students`.
4. Disable or enable a student, refresh, and confirm it persists.
5. Open `/admin/audit-log` and confirm the action was recorded.
6. Open Lesson 1 and Lesson 2 in English and Arabic.
