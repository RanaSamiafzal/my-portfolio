import type { Metadata, Viewport } from "next";
import { Gabarito, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { profile as fallbackProfile } from "@repo/content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Ticker } from "@/components/ticker";
import { loadSettings } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const gabarito = Gabarito({ subsets: ["latin"], variable: "--font-gabarito", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${fallbackProfile.name} — ${fallbackProfile.role}`,
    template: `%s — ${fallbackProfile.name}`,
  },
  description: fallbackProfile.intro,
  keywords: ["Full Stack Engineer", "Next.js", "React", "Node.js", "MERN", "Lahore", "Pakistan", "Rana Muhammad Sami"],
  authors: [{ name: fallbackProfile.name, url: siteUrl }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${fallbackProfile.name} — ${fallbackProfile.role}`,
    description: fallbackProfile.headline,
    siteName: fallbackProfile.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${fallbackProfile.name} — ${fallbackProfile.role}`,
    description: fallbackProfile.headline,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await loadSettings();
  const { profile, ticker, theme } = settings;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Lahore", addressCountry: "PK" },
    alumniOf: profile.education.school,
    url: siteUrl,
    sameAs: [profile.socials.github, profile.socials.linkedin],
    knowsAbout: ["React", "Next.js", "Node.js", "Express", "MongoDB", "PostgreSQL", "Socket.IO", "NextAuth", "Three.js"],
  };

  const themeStyle = {
    ["--color-accent" as string]: theme.accent,
    ["--color-accent-soft" as string]: theme.accentSoft,
    ["--color-cream" as string]: theme.cream,
    ["--color-text" as string]: theme.text,
    ["--color-bg-0" as string]: theme.bg0,
  };

  return (
    <html lang="en" className={`${gabarito.variable} ${grotesk.variable} ${jetbrains.variable}`} style={themeStyle}>
      <body className="min-h-dvh" suppressHydrationWarning>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-black">
          Skip to content
        </a>
        <SmoothScroll />
        <div className="bg-stack" aria-hidden />
        <div className="bg-noise" aria-hidden />
        <Ticker items={ticker} />
        <SiteHeader />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <SiteFooter />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </body>
    </html>
  );
}
