import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Shared server packages read process.env. Vite otherwise exposes .env files
// only through import.meta.env during local development.
const localEnv = loadEnv(process.env.NODE_ENV ?? "development", __dirname, "");
for (const name of ["DATABASE_URL", "AUTH_SECRET", "AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "BLOB_READ_WRITE_TOKEN", "GITHUB_TOKEN", "RESEND_API_KEY", "MAIL_FROM", "MAIL_TO", "MAIL_AUTOREPLY", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "PUBLIC_SITE_URL"]) {
  if (process.env[name] === undefined && localEnv[name]) process.env[name] = localEnv[name];
}

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [react()],
  site: process.env.PUBLIC_SITE_URL || "https://rana-muhammad-sami.vercel.app",
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [tailwindcss()],
    ssr: {
      noExternal: [/^@repo\//],
    },
  },
});
