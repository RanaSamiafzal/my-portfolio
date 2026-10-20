import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { countAdmins, isAdminEmail, verifyAdminCredentials } from "@repo/db";

const providers: NextAuthConfig["providers"] = [];
export const enabledProviders: { id: "github" | "google"; name: string }[] = [];

export { isAdminEmail };

export async function hasSeededAdmin() {
  return (await countAdmins()) > 0;
}

// Admin login against the `admins` table (seeded via `npm run db:seed:admin`).
providers.push(
  Credentials({
    id: "credentials",
    name: "Admin",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? "").trim().toLowerCase();
      const password = String(credentials?.password ?? "");
      if (!email || !password) return null;
      const admin = await verifyAdminCredentials(email, password);
      if (!admin) return null;
      return { id: String(admin.id), email: admin.email, name: admin.name };
    },
  }),
);

// Optional: guestbook visitors can still sign in with GitHub/Google if configured.
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub);
  enabledProviders.push({ id: "github", name: "GitHub" });
}
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
  enabledProviders.push({ id: "google", name: "Google" });
}

function devCookies(prefix: string): NextAuthConfig["cookies"] {
  const options = { httpOnly: true, sameSite: "lax" as const, path: "/", secure: false };
  const names = ["sessionToken", "callbackUrl", "csrfToken", "pkceCodeVerifier", "state", "nonce"] as const;
  const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  return Object.fromEntries(names.map((n) => [n, { name: `${prefix}.${kebab(n)}`, options }]));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  // Lets local builds and previews boot without AUTH_SECRET; production must set it.
  secret: process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? undefined : "dev-only-insecure-secret"),
  trustHost: true,
  // Browsers share cookies across localhost ports, so other local Auth.js apps would
  // collide with ours ("no matching decryption secret"). Namespace them in development.
  cookies: process.env.NODE_ENV === "production" ? undefined : devCookies("portfolio"),
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.isAdmin = await isAdminEmail(user.email);
      }
      return token;
    },
    session({ session, token }) {
      session.user.isAdmin = Boolean(token.isAdmin);
      return session;
    },
  },
});
