# Adacademi-Lite

A lightweight assignment router for tutors using Next.js 15, Turso, and Drizzle. The app tracks students, assignments, tasks, and submission links without managing file storage.

## Features
- Admin dashboard with passphrase gate
- Student and assignment management with bulk task assignment
- Student portal with magic link access codes
- Task status workflow (assigned → in progress → submitted → returned)
- Turso (libSQL) persistence with Drizzle ORM
- TailwindCSS and shadcn/ui primitives for UI

## Getting Started

### Prerequisites
- Node.js 18+
- Turso CLI (optional but recommended)

### Installation
1. Install dependencies
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and populate:
   ```bash
   TURSO_CONNECTION_URL=libsql://...
   TURSO_AUTH_TOKEN=...
   ADMIN_PASSPHRASE=change-me
   ```
3. Generate and push the initial schema:
   ```bash
   npm run db:generate
   npm run db:push
   ```
4. Seed demo data:
   ```bash
   npm run seed
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Turso Quickstart
```bash
# create database
turso db create adacademi-lite

# inspect connection details
turso db show adacademi-lite

# create auth token
turso db tokens create adacademi-lite
```
Use the connection URL and token in your `.env.local` file.

## Google Template Guidance
Assignments should link to Google Docs/Sheets/Slides template URLs ending in `/copy`. Students click **Start** to open the template in a new tab and immediately mark the task as in progress. They later submit a viewable link to their completed artifact.

## Scripts
- `npm run dev` – start Next.js in development mode
- `npm run build` – create a production build
- `npm run start` – run the production server
- `npm run test` – execute Vitest unit tests
- `npm run db:generate` – generate Drizzle migrations
- `npm run db:push` – push the schema to Turso
- `npm run db:migrate` – run pending migrations
- `npm run seed` – populate demo records

## Deploying to Vercel
1. Connect the GitHub repo in Vercel (New Project → Import).
2. In Vercel → Project → Settings → Environment Variables, add:
   - `TURSO_CONNECTION_URL`
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_PASSPHRASE`
   - `ADMIN_EMAILS` (comma-separated list)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET` (generate with `npx auth secret`)
   - Optional: `NEXTAUTH_URL` set to your production URL, e.g. `https://adacademilite.vercel.app`
3. In Google Cloud Console, set OAuth redirect URIs (both providers):
   - Local:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google-drive`
   - Prod (Vercel):
     - `https://adacademilite.vercel.app/api/auth/callback/google`
     - `https://adacademilite.vercel.app/api/auth/callback/google-drive`
   Notes:
   - The app uses incremental auth for Google Drive with a second provider id `google-drive`, which requires the second callback URI.
   - URIs must match exactly (scheme, host, path; no trailing slash).
   - In Google Cloud Console → APIs & Services, enable the Google Drive API for your project.
4. Build settings: Framework = Next.js (defaults are fine). No `vercel.json` required.
5. Database: Run `npm run db:push` locally once against the same Turso DB to create tables. The Vercel build does not run migrations.
6. Push to `main` (or your chosen branch) to trigger a deployment.

## Admin & Student Access
- Visit `/admin` and enter the passphrase defined in `ADMIN_PASSPHRASE` to unlock admin views.
- Students receive magic links at `/s/{accessCode}` (seed script prints codes).

## License
MIT
