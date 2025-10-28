Auth and Deployment

- Admin access uses Google OAuth via NextAuth. Configure env variables:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_SECRET` (random string), `NEXTAUTH_URL`
  - `ADMIN_EMAILS` (comma-separated): doc@ensodirectcare.com,jennifer@ensodirectcare.com
  - DB: `TURSO_CONNECTION_URL`, `TURSO_AUTH_TOKEN`
- Middleware guards `/admin/:path*` and only allows emails in `ADMIN_EMAILS`.
- Install dependency: `npm i next-auth`.
- Google redirect URIs:
  - Local: `http://localhost:3000/api/auth/callback/google`
  - Prod: `https://<your-domain>/api/auth/callback/google`
- Vercel: add all env vars under Project → Settings → Environment Variables.
