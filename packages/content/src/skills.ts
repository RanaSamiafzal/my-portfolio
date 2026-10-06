export type SkillGroup = { id: string; title: string; blurb: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    title: "Frontend & UI",
    blurb: "Responsive, accessible interfaces translated faithfully from Figma.",
    items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML / CSS", "Ant Design", "shadcn/ui", "Framer Motion", "Three.js"],
  },
  {
    id: "backend",
    title: "Backend & APIs",
    blurb: "REST and WebSocket APIs with auth, validation and hardening built in.",
    items: ["Node.js", "Express.js", "REST APIs", "Socket.IO / WebSockets", "JWT", "NextAuth", "Google OAuth", "Stripe Connect", "Joi / Zod"],
  },
  {
    id: "data",
    title: "Data",
    blurb: "Document and relational stores, typed with an ORM where it pays off.",
    items: ["MongoDB", "PostgreSQL", "Neon", "MySQL", "Firebase", "Prisma ORM", "Drizzle ORM", "Mongoose"],
  },
  {
    id: "state",
    title: "State management",
    blurb: "The right amount of state machinery for the problem.",
    items: ["Redux Toolkit", "Zustand", "Context API", "TanStack Query"],
  },
  {
    id: "ai",
    title: "AI features",
    blurb: "LLM features kept server-side, explainable and confirm-before-act.",
    items: ["OpenAI API", "Matching / ranking", "Tool calling", "Embeddable agents", "Cursor", "Codex", "Antigravity"],
  },
  {
    id: "tools",
    title: "Tools & workflow",
    blurb: "Shipping with a team: version control, testing, tickets.",
    items: ["Git", "GitHub", "Turborepo", "Vercel", "Postman", "Thunder Client", "Figma", "Jira", "Trello", "Slack", "Adobe Suite"],
  },
];

export const marqueeStack = [
  "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Express", "Socket.IO", "MongoDB",
  "PostgreSQL", "Neon", "Prisma", "Drizzle", "Redux Toolkit", "Zustand", "Tailwind", "NextAuth",
  "Stripe", "Firebase", "Three.js", "OpenAI", "Turborepo", "Vercel", "Git", "Figma",
];
