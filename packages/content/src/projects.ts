export type ProjectCategory = "AI & SaaS" | "Real-time" | "Full-stack" | "Client work";

export type CaseStudy = {
  problem: string;
  role: string;
  architecture: { name: string; detail: string }[];
  highlights: { title: string; body: string }[];
  decisions: string[];
  next?: string;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  period: string;
  context: string;
  status: "Live" | "In progress" | "Shipped";
  featured?: boolean;
  categories: ProjectCategory[];
  stack: string[];
  /** Normalised core technologies, used for the "most-used stack" stats. */
  tech: string[];
  links: { label: string; href: string }[];
  caseStudy?: CaseStudy;
  /** Path under /public, e.g. /projects/brandly.jpg */
  image?: string;
  /** Hostname shown in the browser chrome mock */
  imageUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "brandly",
    name: "Brandly",
    tagline: "AI-powered brand–influencer collaboration platform",
    summary:
      "Two-sided SaaS marketplace that matches brands with influencers using a weighted AI ranking engine, then runs the whole collaboration: mutual agreements, real-time chat, per-deliverable review and Stripe escrow payouts.",
    period: "2025 — 2026",
    context: "Final year project · Lead developer",
    status: "Live",
    featured: true,
    categories: ["AI & SaaS", "Real-time", "Full-stack"],
    tech: ["React", "Next.js", "Node.js", "Express", "Socket.IO", "PostgreSQL", "Prisma", "MongoDB", "Stripe", "Zustand", "Tailwind CSS", "JWT / OAuth"],
    stack: [
      "Next.js 15",
      "Express 5",
      "Socket.IO",
      "Prisma",
      "Neon Postgres",
      "MongoDB",
      "Stripe Connect",
      "Zustand",
      "Google OAuth",
      "Cloudinary",
    ],
    image: "/projects/brandly.jpg",
    imageUrl: "brandly-five.vercel.app",
    links: [
      { label: "Live", href: "https://brandly-five.vercel.app" },
      { label: "Monorepo", href: "https://github.com/RanaSamiafzal/Brandly" },
      { label: "API", href: "https://github.com/RanaSamiafzal/brandy-backend" },
      { label: "UI system", href: "https://github.com/RanaSamiafzal/Brandy-figma-Ui" },
    ],
    caseStudy: {
      problem:
        "Brands waste days hand-picking influencers from spreadsheets, and influencers have no guarantee they'll be paid once content is delivered. Brandly turns discovery into a ranked shortlist and payment into an escrow that only releases when each deliverable is approved.",
      role:
        "Primary developer across the stack — monorepo architecture, data model, API, real-time layer, AI matching engine, payments and most of the UI.",
      architecture: [
        { name: "frontend/main-app", detail: "Next.js 15 App Router UI with separate brand, influencer and admin dashboards" },
        { name: "@repo/ui · @repo/store", detail: "Shared React component library and Zustand global stores" },
        { name: "@repo/core", detail: "Express services plus a Socket.IO server with project-scoped rooms" },
        { name: "@repo/database", detail: "Prisma ORM on Neon serverless Postgres, repository pattern per aggregate" },
        { name: "@repo/ai-engine", detail: "Compatibility scoring and ranking, isolated so it can be swapped for an ML model" },
      ],
      highlights: [
        {
          title: "3-layer AI matching",
          body: "Campaigns are scored against every influencer profile on niche, budget and audience fit. The ranker returns the top N with a per-factor score breakdown, so brands see why someone matched, not just that they did.",
        },
        {
          title: "Escrow per deliverable",
          body: "Brands fund collaborations through Stripe PaymentIntents. Funds release to the influencer's Stripe Connect Express account per approved deliverable, with webhook signature verification.",
        },
        {
          title: "Real-time everything",
          body: "Socket.IO rooms push chat messages, collaboration requests, deliverable status, payments and notifications live, with an activity log and read/unread notification centre.",
        },
        {
          title: "Verified reach",
          body: "Influencers connect YouTube, Instagram, Facebook, TikTok or LinkedIn via OAuth to prove their audience, and profile-completion gating keeps half-finished profiles out of matching.",
        },
        {
          title: "Hardened auth",
          body: "JWT access + refresh cookies with rotation, Google OAuth via Passport, OTP email password reset, role-based access for brand, influencer and admin.",
        },
        {
          title: "API defence",
          body: "Joi validation on every route, Helmet headers, Mongo sanitisation and rate limiting on auth endpoints, Cloudinary for media uploads.",
        },
      ],
      decisions: [
        "Split the codebase into npm workspaces so the AI engine, data layer and UI kit evolve independently and can be tested in isolation.",
        "Kept matching deterministic and explainable first (weighted formula + breakdown) rather than a black-box model — easier to debug and to justify to users.",
        "Released escrow per deliverable instead of per campaign, which limits risk for both sides on long collaborations.",
      ],
      next: "Analytics for campaign performance and swapping the weighted ranker for a learned model trained on accepted collaborations.",
    },
  },
  {
    slug: "aide",
    name: "AIDE",
    tagline: "AI customer-support agents businesses embed on their own site",
    summary:
      "SaaS platform where teams build support agents grounded in their own FAQs and documents, give them allowlisted HTTP actions behind confirm gates, test them in a studio, then embed the widget with one script tag — with handoff to humans and sentiment/topic analytics.",
    period: "2026 — present",
    context: "SaaS product · Builder",
    status: "Live",
    featured: true,
    categories: ["AI & SaaS", "Full-stack"],
    tech: ["React", "Next.js", "TypeScript", "Node.js", "LLM APIs"],
    stack: ["Next.js", "TypeScript", "Node.js", "LLM APIs", "RAG", "Tool calling", "Embeddable widget"],
    image: "/projects/aide.jpg",
    imageUrl: "ai-customer-support-agent-coral.vercel.app",
    links: [{ label: "Live", href: "https://ai-customer-support-agent-coral.vercel.app" }],
    caseStudy: {
      problem:
        "Support teams drown in repetitive tickets, but generic chatbots invent policy and can't safely act for a customer. AIDE answers only from the business's own knowledge and runs real actions — order status, refunds — behind explicit confirmation.",
      role: "Full-stack developer — agent runtime, knowledge retrieval, actions, studio, embeddable widget and analytics.",
      architecture: [
        { name: "Knowledge", detail: "FAQs and PDFs are retrieved per question, and replies come back with citations" },
        { name: "Actions", detail: "Owner-configured HTTP tools on an allowlist; write actions pass a confirm gate first" },
        { name: "Studio", detail: "Configure tone, tools and handoff rules, then test as a visitor before going live" },
        { name: "embed.js", detail: "One script tag with a per-business key mounts the widget — already running on Brandly" },
        { name: "Insights", detail: "Every conversation becomes structured signal: resolution, sentiment, topics, handoffs" },
      ],
      highlights: [
        { title: "Grounded answers", body: "The agent answers from the business's own documents with citations, instead of inventing policy." },
        { title: "Confirm before acting", body: "Tools that change data — like refunds — pause for the visitor's confirmation first." },
        { title: "Human handoff", body: "Hard conversations hand off to a human desk with the full context attached." },
        { title: "One-line install", body: "A single script tag with a business key; no framework lock-in on the host site." },
        { title: "Analytics", body: "Sentiment and topic trends, resolution rate and reply time across the last 7 days." },
        { title: "Dogfooded", body: "The widget runs on Brandly's live site, so it's tested against a real product." },
      ],
      decisions: [
        "Made guest mode the default so the widget works on public sites with zero integration, and authenticated mode an opt-in upgrade.",
        "Kept the embed contract tiny (key + optional auth callback) so host sites can't break the agent.",
      ],
    },
  },
  {
    slug: "magnetic",
    name: "Magnetic",
    tagline: "One AI workspace to code, generate images and create video",
    summary:
      "AI workspace and desktop code editor: describe an outcome, get a plan, watch the agent build with tests in view, then review before anything ships — alongside image generation and video creation for the same project.",
    period: "2026 — present",
    context: "Team product · Contributor",
    status: "Live",
    featured: true,
    categories: ["AI & SaaS"],
    tech: ["React", "Next.js", "TypeScript", "Electron", "LLM APIs"],
    stack: ["Next.js", "TypeScript", "Electron", "AI agents", "Vercel"],
    image: "/projects/magnetic.jpg",
    imageUrl: "megnetic-ai.vercel.app",
    links: [{ label: "Live", href: "https://megnetic-ai.vercel.app" }],
  },
  {
    slug: "spendwise",
    name: "SpendWise",
    tagline: "Personal finance dashboard with an AI advisor",
    summary:
      "Finance dashboard to track income and expenses, set budgets and monitor subscription burn — with a backend-protected OpenAI finance advisor and chat copilot that turn transactions into insight.",
    period: "2026",
    context: "Personal product",
    status: "Shipped",
    categories: ["AI & SaaS", "Full-stack"],
    tech: ["React", "Next.js", "Redux Toolkit", "Node.js", "Express", "MongoDB", "LLM APIs", "JWT / OAuth", "Tailwind CSS"],
    stack: ["Next.js", "Redux Toolkit", "Tailwind", "Node.js", "Express", "MongoDB", "JWT", "OpenAI"],
    links: [
      { label: "GitHub", href: "https://github.com/RanaSamiafzal/spendwise-app" },
    ],
    caseStudy: {
      problem:
        "Most budgeting apps show charts but never tell you what to change. SpendWise pairs a clean dashboard with an AI advisor that reads your actual transactions and subscriptions.",
      role: "Sole developer — frontend, API, data model and AI integration.",
      architecture: [
        { name: "Next.js app", detail: "Dashboard UI with Redux Toolkit slices for auth, transactions, subscriptions and AI" },
        { name: "Express API", detail: "JWT-protected REST endpoints with bcrypt-hashed credentials" },
        { name: "MongoDB", detail: "Persistent transactions and subscriptions via Mongoose" },
        { name: "AI service", detail: "OpenAI called only from the server, so keys never reach the browser" },
      ],
      highlights: [
        { title: "AI advisor + copilot", body: "Ask questions about your own spending; insights are generated server-side from stored data." },
        { title: "Subscription burn", body: "Recurring payments are tracked separately with a monthly burn figure so silent costs surface." },
        { title: "Mobile-first", body: "Responsive dashboard layout with interactive charts and transaction management." },
      ],
      decisions: [
        "Moved every AI call behind the backend to protect API keys and allow rate limiting.",
        "Used Redux Toolkit for predictable state across four interdependent domains.",
      ],
    },
  },
  {
    slug: "pchat",
    name: "PChat",
    tagline: "Real-time chat rooms that disappear",
    summary:
      "Real-time messaging with expiring rooms, one-click invite links, LAN room discovery, drag-and-drop file sharing, admin controls and both group and direct chats — on Firebase Auth and the Realtime Database.",
    period: "2026",
    context: "Personal project",
    status: "Live",
    featured: true,
    categories: ["Real-time", "Full-stack"],
    tech: ["React", "Firebase", "Tailwind CSS"],
    stack: ["React 19", "React Router 7", "Firebase Auth", "Realtime Database", "Tailwind CSS"],
    image: "/projects/pchat.jpg",
    imageUrl: "react-firebase-chat-chi-seven.vercel.app",
    links: [
      { label: "Live", href: "https://react-firebase-chat-chi-seven.vercel.app" },
      { label: "GitHub", href: "https://github.com/RanaSamiafzal/react-firebase-chat" },
    ],
  },
  {
    slug: "the-wedding-poets",
    name: "The Wedding Poets",
    tagline: "Full-stack studio website with inquiry pipeline",
    summary:
      "Website for the wedding film studio I edit for: portfolio, packages, testimonials and an inquiry form persisted to Postgres. Typed end to end with shared Zod schemas between client and server.",
    period: "2025",
    context: "Client work",
    status: "Shipped",
    categories: ["Client work", "Full-stack"],
    tech: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Drizzle", "Tailwind CSS"],
    stack: ["React", "TypeScript", "Express", "Drizzle ORM", "Neon Postgres", "Zod", "TanStack Query", "shadcn/ui"],
    links: [{ label: "GitHub", href: "https://github.com/RanaSamiafzal/SageWeddings" }],
  },
  {
    slug: "portfolio",
    name: "This portfolio",
    tagline: "Next.js monorepo with Three.js, NextAuth and Postgres",
    summary:
      "Turborepo monorepo: a Next.js App Router site, shared content/UI/db packages, a Three.js particle portrait, NextAuth sign-in for the guestbook, an admin inbox and an agent-readable hire API.",
    period: "2026",
    context: "Personal",
    status: "Live",
    categories: ["Full-stack"],
    tech: ["React", "Next.js", "TypeScript", "Three.js", "NextAuth", "PostgreSQL", "Tailwind CSS", "JWT / OAuth"],
    stack: ["Next.js", "Turborepo", "Three.js", "NextAuth", "Neon Postgres", "Tailwind v4"],
    links: [{ label: "GitHub", href: "https://github.com/RanaSamiafzal/my-portfolio" }],
  },
];

export const projectCategories: ProjectCategory[] = ["AI & SaaS", "Real-time", "Full-stack", "Client work"];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** How many projects use each technology, most-used first. */
export function stackUsage() {
  const counts = new Map<string, string[]>();
  for (const p of projects) for (const t of p.tech) counts.set(t, [...(counts.get(t) ?? []), p.name]);
  return [...counts.entries()]
    .map(([name, used]) => ({ name, count: used.length, pct: Math.round((used.length / projects.length) * 100), projects: used }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
