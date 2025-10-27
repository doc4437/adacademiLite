import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }: any) {
      if (profile?.email) token.email = profile.email;
      return token;
    },
    async session({ session, token }: any) {
      if (token?.email) {
        session.user = { ...session.user, email: token.email };
      }
      return session;
    },
  },
  pages: {},
  secret: process.env.NEXTAUTH_SECRET,
} as const;

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };

