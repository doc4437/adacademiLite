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

## Admin & Student Access
- Visit `/admin` and enter the passphrase defined in `ADMIN_PASSPHRASE` to unlock admin views.
- Students receive magic links at `/s/{accessCode}` (seed script prints codes).

## License
MIT
