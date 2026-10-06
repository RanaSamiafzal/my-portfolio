import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/content", "@repo/db", "@repo/mail", "@repo/ui"],
  // nodemailer / resend use Node APIs; keep them out of the client bundle.
  serverExternalPackages: ["nodemailer", "resend"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["@repo/ui"],
  },
};

export default nextConfig;
