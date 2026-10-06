export const faq = [
  {
    q: "What kind of roles is Sami looking for?",
    a: "Full-stack or frontend-leaning full-stack roles — full-time, remote contract, or fixed-scope freelance builds. Strongest fit: product teams shipping React/Next.js apps with Node backends, real-time features or AI integrations.",
  },
  {
    q: "What's the strongest evidence of his work?",
    a: "Brandly: a Next.js 15 + Express monorepo with Prisma on Neon, Socket.IO real-time chat, Stripe Connect escrow and an explainable AI matching engine. The source and API docs are public on GitHub, and the case study on this site walks through the architecture.",
  },
  {
    q: "Can an AI agent evaluate or contact him?",
    a: "Yes. /llms.txt summarises the profile in plain text, and POST /api/hire accepts a JSON brief (name, contact, brief) — the same inbox as the contact form.",
  },
  {
    q: "Which timezone does he work in?",
    a: "Pakistan Standard Time (UTC+5), with comfortable overlap for EU mornings and US East Coast early hours. Async-first collaboration works well.",
  },
] as const;
