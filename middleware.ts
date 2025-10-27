import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      const allowed = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const email = (token?.email as string | undefined)?.toLowerCase();
      return !!email && allowed.includes(email);
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};

