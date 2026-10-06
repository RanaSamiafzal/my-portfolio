export type Role = {
  year: string;
  period: string;
  title: string;
  company: string;
  location: string;
  points: string[];
  stack: string[];
};

export const experience: Role[] = [
  {
    year: "2026",
    period: "Jun 2026 → Aug 2026",
    title: "Full Stack Intern",
    company: "Happy Co",
    location: "Lahore, Pakistan",
    points: [
      "Built responsive, reusable React interfaces for production features.",
      "Collaborated with a cross-functional team using agile workflows and Git-based version control.",
      "Optimised application performance and improved component load times.",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS", "Git", "Agile"],
  },
  {
    year: "2025",
    period: "2025 → 2026",
    title: "Lead Developer — Final Year Project",
    company: "Brandly",
    location: "GCU Faisalabad",
    points: [
      "Architected an npm-workspaces monorepo: Next.js 15 UI, Express + Socket.IO core, Prisma/Neon data layer and an isolated AI engine.",
      "Built a weighted AI matching engine that ranks influencers per campaign with an explainable score breakdown.",
      "Implemented Stripe Connect escrow released per approved deliverable, plus JWT refresh rotation and Google OAuth.",
    ],
    stack: ["Next.js", "Express", "Socket.IO", "Prisma", "Stripe"],
  },
  {
    year: "2022",
    period: "Aug 2022 → Present",
    title: "Video Editor",
    company: "The Wedding Poets",
    location: "Lahore, Pakistan",
    points: [
      "Edit cinematic wedding films in Adobe Premiere Pro and After Effects.",
      "Deliver to tight deadlines against detailed client briefs.",
      "Built the studio's full-stack website and inquiry pipeline.",
    ],
    stack: ["Premiere Pro", "After Effects", "Storytelling"],
  },
];
