import type { AuthConfig } from "@auth/core";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { isAdminEmail } from "@repo/db";
import { authSecret } from "./auth-secret";

export const OAUTH_COOKIE = "portfolio.oauth";
export function oauthProviders() {
  return [
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? [GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET })] : []),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })] : []),
  ];
}

export function oauthConfig(): AuthConfig {
  return {
    basePath: "/api/auth",
    secret: authSecret(),
    trustHost: true,
    session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
    providers: oauthProviders(),
    cookies: { sessionToken: { name: OAUTH_COOKIE, options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" } } },
    callbacks: {
      async signIn({ user, account, profile }) {
        return Boolean(user.email) && (account?.provider !== "google" || profile?.email_verified === true);
      },
      async jwt({ token, user }) {
        if (user) token.isAdmin = await isAdminEmail(user.email);
        return token;
      },
    },
  };
}
