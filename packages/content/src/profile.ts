export const profile = {
  name: "Rana Muhammad Sami",
  shortName: "Sami",
  handle: "ranasami",
  role: "Full Stack Engineer",
  headline: "Full Stack Engineer for web products and AI systems",
  rotating: [
    "AI SUPPORT AGENTS",
    "REAL-TIME PLATFORMS",
    "AI MATCHING ENGINES",
    "NEXT.JS MONOREPOS",
    "PAYMENT ESCROW FLOWS",
  ],
  intro:
    "Full stack engineer. AI-powered products, real-time platforms and production-ready systems — from database schema to the last pixel. Builder of Brandly and AIDE, both live.",
  location: "Lahore, Pakistan",
  timezone: "PKT · UTC+5",
  availability: "Open to full-time roles, remote contracts and freelance builds",
  email: "ranasami0909@gmail.com",
  phone: "+92 321 5594873",
  phoneHref: "tel:+923215594873",
  whatsapp: "https://wa.me/923215594873",
  cv: "/Rana_Muhammad_Sami_CV.pdf",
  portrait: "/portrait.jpg",
  socials: {
    github: "https://github.com/RanaSamiafzal",
    linkedin: "https://www.linkedin.com/in/rana-muhammad-sami-503b6a241/",
  },
  githubUser: "RanaSamiafzal",
  education: {
    degree: "BS Computer Science",
    school: "Government College University, Faisalabad",
    status: "Completed",
  },
  courses: [
    { title: "Full Stack Development", org: "Hunarmand Punjab", year: "2026" },
    { title: "Advanced Web Development", org: "NAVTTC", year: "2025" },
    { title: "JavaScript Essentials for Beginners", org: "Online", year: "2025" },
    { title: "AI For Everyone", org: "Online", year: "2025" },
  ],
  about: [
    "I'm a full-stack engineer based in Lahore. I work across the whole product: data models in MongoDB or Postgres, Express and Next.js APIs, real-time layers with Socket.IO, and the React interfaces people actually touch.",
    "My flagship build is Brandly, an AI-powered brand–influencer marketplace: an npm-workspaces monorepo with a Next.js App Router frontend, an Express + Socket.IO core, Prisma on Neon Postgres, a dedicated AI ranking engine, and Stripe Connect escrow that releases funds per deliverable.",
    "Right now I'm building AIDE, an AI customer-support platform: agents grounded in a business's own documents, with confirm-gated actions, a test studio and a one-line embeddable widget — already running on Brandly. Most recently I interned as a full-stack developer at Happy Co, shipping reusable React interfaces for production features.",
    "Before code, I spent years as a video editor for The Wedding Poets — cinematic storytelling on hard deadlines with demanding clients. That's where my eye for detail and my habit of shipping on time come from.",
  ],
} as const;

export const ticker = [
  "FULL STACK ENGINEER",
  "OPEN TO WORK",
  "NEXT.JS · REACT · NODE",
  "REAL-TIME · SOCKET.IO",
  "AI-POWERED FEATURES",
  "BASED IN LAHORE",
  "REMOTE FRIENDLY",
  "AGENT-READY · HUMANS WELCOME",
  "AVAILABLE FOR FULL-TIME ROLES",
  "OPEN TO FREELANCE CONTRACTS",
];

export const services = [
  {
    id: "01",
    title: "Full-stack product builds",
    body: "From schema to screen: Next.js or React frontends, Node/Express APIs, MongoDB or Postgres, auth and deployment — shipped as one coherent system.",
    tags: ["Next.js", "Node / Express", "Postgres · Mongo"],
  },
  {
    id: "02",
    title: "Real-time & AI features",
    body: "Live chat, notifications and collaboration over Socket.IO, plus AI features wired in safely — matching engines, copilots and support agents behind your own API.",
    tags: ["Socket.IO", "LLM APIs", "Matching"],
  },
  {
    id: "03",
    title: "Auth, payments & hardening",
    body: "JWT access/refresh rotation, Google OAuth, NextAuth, OTP flows, Stripe Connect escrow, rate limiting and input sanitisation — the parts that must not break.",
    tags: ["NextAuth", "Stripe", "Security"],
  },
] as const;

export const navLinks = [
  { href: "/", label: "Home", index: "00" },
  { href: "/work", label: "Work", index: "01" },
  { href: "/stack", label: "Stack", index: "02" },
  { href: "/about", label: "About", index: "03" },
  { href: "/guestbook", label: "Guestbook", index: "04" },
  { href: "/contact", label: "Contact", index: "05" },
] as const;
