-[ ] Forgiving of assigments functionality? Teachers ability to mark assigments as turned in. 
    - May not be completely necessary as assignments can be marked as completed ("submitted") from the students page.

-[x] What happens when assigments get returned? What does returning assigments even mean?

-[x] Apply assignmnets history functionality to student profiles.  Assignment history needs to have the ability to view submission from the students page (to view submitted assignments from the link)

-[x] What happens to assignmnets that have been completely turned in by all of the students? Do they disappear from the current assignments tab in /assignments?

---

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
