import type { Metadata } from "next";
import { Card, SectionLabel } from "@repo/ui";
import { ContactForm } from "@/components/contact-form";
import { loadProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about full-time roles, contracts or freelance projects.",
};

export const revalidate = 3600;

export default async function ContactPage() {
  const profile = await loadProfile();
  const channels = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}`, note: "Best for detailed briefs and job offers." },
    { label: "Phone / WhatsApp", value: profile.phone, href: profile.whatsapp, note: "Lahore, Pakistan. WhatsApp works well." },
    { label: "LinkedIn", value: "rana-muhammad-sami", href: profile.socials.linkedin, note: "Professional history and recommendations." },
    { label: "GitHub", value: profile.githubUser, href: profile.socials.github, note: "Source for most of the projects here." },
  ];

  return (
    <div className="container-x pb-24 pt-16 md:pt-24">
      <SectionLabel index="05">Contact</SectionLabel>
      <h1 className="mt-5 h-display text-[clamp(2.8rem,7vw,5.5rem)] leading-none tracking-tight">Let&apos;s talk.</h1>
      <p className="mt-6 max-w-[58ch] leading-relaxed text-muted">{profile.availability}. The form is the fastest route to a reply — usually within a day.</p>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6 md:p-8">
          <ContactForm />
        </Card>
        <div className="space-y-3">
          {channels.map((c) => (
            <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block">
              <Card className="p-5 hover:border-accent/50">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-soft">{c.label}</p>
                <p className="mt-1 text-lg text-text">{c.value}</p>
                <p className="mt-1 text-sm text-muted-soft">{c.note}</p>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
