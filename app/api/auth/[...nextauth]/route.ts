import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Helper to refresh Google OAuth access tokens
async function refreshGoogleAccessToken(token: any) {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to refresh access token");
    }

    const now = Date.now();
    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: now + (data.expires_in ? data.expires_in * 1000 : 55 * 60 * 1000),
      // Keep the same refresh token if Google doesn't return a new one
      refreshToken: data.refresh_token ?? token.refreshToken,
      scope: data.scope ?? token.scope,
      tokenType: data.token_type ?? token.tokenType,
      error: undefined,
    };
  } catch (err) {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    // Default Google sign-in for admin/any basic usage
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
    // Google provider with Drive scope for incremental auth when students start work
    GoogleProvider({
      id: "google-drive",
      name: "Google (Drive)",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            // Least-privilege: manage files the app creates
            "https://www.googleapis.com/auth/drive.file",
          ].join(" "),
          prompt: "consent",
          access_type: "offline",
          include_granted_scopes: "true",
          response_type: "code",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // Persist email for middleware checks
      if (profile?.email) token.email = profile.email;

      // Initial sign-in: persist OAuth tokens
      if (account) {
        const now = Date.now();
        token.accessToken = account.access_token ?? token.accessToken;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        // expires_at from Google is in seconds; convert to ms
        const expiresAt = account.expires_at ? account.expires_at * 1000 : now + (account.expires_in ? account.expires_in * 1000 : 55 * 60 * 1000);
        token.accessTokenExpires = expiresAt;
        token.scope = account.scope ?? token.scope;
        token.tokenType = account.token_type ?? token.tokenType;
        return token;
      }

      // Return previous token if still valid
      if (token.accessToken && token.accessTokenExpires && Date.now() < token.accessTokenExpires - 60 * 1000) {
        return token;
      }

      // Try to refresh if we have a refresh token
      if (token.refreshToken) {
        return await refreshGoogleAccessToken(token);
      }

      // No refresh possible; return token as-is
      return token;
    },
    async session({ session, token }: any) {
      if (token?.email) {
        session.user = { ...session.user, email: token.email };
      }
      // Expose minimal OAuth state to client
      session.oauth = {
        hasDrive: typeof token.scope === "string" && token.scope.includes("https://www.googleapis.com/auth/drive.file"),
        accessToken: token.accessToken ?? undefined,
        accessTokenExpires: token.accessTokenExpires ?? undefined,
      };
      return session;
    },
  },
  pages: {},
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
