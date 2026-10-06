"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/* ─────────────────────────── data passed from the server ─────────────────────────── */

export type ShellProject = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  status: string;
  period: string;
  context: string;
  stack: string[];
  tech: string[];
  links: { label: string; href: string }[];
  hasCase: boolean;
};

export type ShellData = {
  name: string;
  role: string;
  location: string;
  timezone: string;
  email: string;
  github: string;
  githubUser: string;
  linkedin: string;
  cv: string;
  about: string[];
  education: string;
  experience: { period: string; title: string; company: string; points: string[] }[];
  projects: ShellProject[];
  stack: { name: string; pct: number; count: number; projects: string[] }[];
};

/* ─────────────────────────── virtual filesystem ─────────────────────────── */

type FsNode = { type: "dir"; children: Record<string, FsNode> } | { type: "file"; content: string };

function buildFs(d: ShellData): FsNode {
  const projects: Record<string, FsNode> = {};
  for (const p of d.projects) {
    projects[p.slug] = {
      type: "dir",
      children: {
        "README.md": {
          type: "file",
          content: `# ${p.name}\n> ${p.tagline}\n\n${p.summary}\n\nstatus:  ${p.status}\nperiod:  ${p.period}\ncontext: ${p.context}`,
        },
        "stack.txt": { type: "file", content: p.stack.join("\n") },
        "links.txt": {
          type: "file",
          content: p.links.length ? p.links.map((l) => `${l.label.padEnd(10)} ${l.href}`).join("\n") : "private repo — demo on request",
        },
      },
    };
  }
  return {
    type: "dir",
    children: {
      "about.md": { type: "file", content: `# ${d.name}\n${d.role} · ${d.location}\n\n${d.about.join("\n\n")}\n\neducation: ${d.education}` },
      "contact.txt": { type: "file", content: `email     ${d.email}\ngithub    ${d.github}\nlinkedin  ${d.linkedin}\ncv        ${d.cv}` },
      "experience.log": {
        type: "file",
        content: d.experience.map((e) => `[${e.period}] ${e.title} @ ${e.company}\n${e.points.map((p) => `  - ${p}`).join("\n")}`).join("\n\n"),
      },
      "stack.json": {
        type: "file",
        content: JSON.stringify(Object.fromEntries(d.stack.map((s) => [s.name, `${s.count}/${d.projects.length} projects`])), null, 2),
      },
      projects: { type: "dir", children: projects },
    },
  };
}

/** Resolve a path against cwd. Supports ~, /, ., .. and trailing slashes. */
function resolve(cwd: string[], input: string): string[] {
  const parts = input.startsWith("~") || input.startsWith("/") ? [] : [...cwd];
  for (const seg of input.replace(/^~\/?|^\//, "").split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return parts;
}

function lookup(root: FsNode, path: string[]): FsNode | null {
  let node: FsNode = root;
  for (const seg of path) {
    if (node.type !== "dir" || !node.children[seg]) return null;
    node = node.children[seg]!;
  }
  return node;
}

function treeLines(node: FsNode, prefix = ""): string[] {
  if (node.type !== "dir") return [];
  const entries = Object.entries(node.children);
  return entries.flatMap(([name, child], i) => {
    const last = i === entries.length - 1;
    const line = `${prefix}${last ? "└── " : "├── "}${name}${child.type === "dir" ? "/" : ""}`;
    return [line, ...treeLines(child, prefix + (last ? "    " : "│   "))];
  });
}

/* ─────────────────────────── commands metadata ─────────────────────────── */

const COMMANDS: Record<string, { usage: string; desc: string }> = {
  help: { usage: "help", desc: "list commands" },
  man: { usage: "man <cmd>", desc: "manual for a command" },
  neofetch: { usage: "neofetch", desc: "system info card" },
  whoami: { usage: "whoami", desc: "who is this engineer" },
  ls: { usage: "ls [path]", desc: "list directory" },
  cd: { usage: "cd <path>", desc: "change directory" },
  pwd: { usage: "pwd", desc: "print working directory" },
  cat: { usage: "cat <file>", desc: "print a file" },
  tree: { usage: "tree", desc: "show the whole filesystem" },
  projects: { usage: "projects", desc: "list shipped projects" },
  open: { usage: "open <project>", desc: "open case study or live site" },
  grep: { usage: "grep <tech>", desc: "find projects using a technology" },
  stack: { usage: "stack", desc: "most-used technologies (bar chart)" },
  github: { usage: "github", desc: "live repos from the GitHub API" },
  ping: { usage: "ping <project>", desc: "measure latency to a live deployment" },
  curl: { usage: "curl <path>", desc: "call a same-origin endpoint (/api/hire, /llms.txt)" },
  hire: { usage: "hire", desc: "send me a brief from the terminal" },
  contact: { usage: "contact", desc: "ways to reach me" },
  cv: { usage: "cv", desc: "download my CV" },
  date: { usage: "date", desc: "current time in Lahore" },
  echo: { usage: "echo <text>", desc: "print text" },
  history: { usage: "history", desc: "previous commands" },
  matrix: { usage: "matrix", desc: "¯\\_(ツ)_/¯" },
  clear: { usage: "clear", desc: "clear screen (Ctrl+L)" },
};

const ASCII = [
  "  ____  ____  ",
  " |  _ \\/ ___| ",
  " | |_) \\___ \\ ",
  " |  _ < ___) |",
  " |_| \\_\\____/ ",
];

type Line = { id: number; node: ReactNode };
type Mode = { kind: "shell" } | { kind: "hire"; step: 0 | 1 | 2; data: { name?: string; contact?: string } };

const HIRE_PROMPTS = ["your name", "email or WhatsApp", "what do you want to build?"] as const;

/* ─────────────────────────── component ─────────────────────────── */

export function Terminal({ data }: { data: ShellData }) {
  const router = useRouter();
  const fs = useMemo(() => buildFs(data), [data]);
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [cwd, setCwd] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: "shell" });
  const [busy, setBusy] = useState(false);
  const [matrix, setMatrix] = useState(false);
  const [booted, setBooted] = useState(false);
  const [clock, setClock] = useState("--:--");
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = useCallback((...nodes: ReactNode[]) => {
    setLines((l) => [...l, ...nodes.map((node) => ({ id: idRef.current++, node }))]);
  }, []);

  const cwdLabel = `~${cwd.length ? "/" + cwd.join("/") : ""}`;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines, busy]);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" });
    const tick = () => setClock(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);

  /* boot sequence: when the terminal first scrolls into view, or instantly on first click/focus */
  const bootStarted = useRef(false);
  const boot = useCallback(
    (instant: boolean) => {
      if (bootStarted.current) return;
      bootStarted.current = true;
      const steps: ReactNode[] = [
        <Ok key="1">mounting filesystem · {data.projects.length} projects</Ok>,
        <Ok key="2">indexing stack · {data.stack.length} technologies</Ok>,
        <Ok key="3">linking api.github.com/{data.githubUser}</Ok>,
        <Ok key="4">POST /api/hire ready</Ok>,
        <span key="5">
          <span className="text-text">ranasami.dev shell v2.0</span> — type <K>help</K>, or try <K>neofetch</K>. <Dim>Tab completes, ↑ recalls.</Dim>
        </span>,
      ];
      if (instant) {
        push(...steps);
        setBooted(true);
        setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }
      steps.forEach((step, i) => setTimeout(() => push(step), 140 * i + 120));
      setTimeout(() => setBooted(true), 140 * steps.length + 140);
    },
    [data, push],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        boot(false);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [boot]);

  /* ─────────── command implementations ─────────── */

  const findProject = (q: string) =>
    data.projects.find((p) => p.slug === q || p.name.toLowerCase() === q || p.slug.startsWith(q));

  const run = async (raw: string) => {
    const input = raw.trim();

    // Interactive hire wizard
    if (mode.kind === "hire") {
      push(<Echo prompt={`${HIRE_PROMPTS[mode.step]}:`}>{input}</Echo>);
      if (!input) return push(<Err>required — or press Ctrl+C to cancel</Err>);
      if (mode.step === 0) return setMode({ kind: "hire", step: 1, data: { name: input } });
      if (mode.step === 1) return setMode({ kind: "hire", step: 2, data: { ...mode.data, contact: input } });
      setMode({ kind: "shell" });
      setBusy(true);
      push(<Dim>POST /api/hire …</Dim>);
      try {
        const res = await fetch("/api/hire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: mode.data.name, contact: mode.data.contact, brief: input, agent: "terminal" }),
        });
        const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (res.ok) {
          const via = [json.stored && "saved to inbox", json.emailed && "emailed to Sami"].filter(Boolean).join(" · ");
          push(<Ok>{res.status} Created — brief{json.id ? ` #${String(json.id)}` : ""} delivered{via ? ` (${via})` : ""}. I&apos;ll reply soon.</Ok>);
        }
        else if (res.status === 400) push(<Err>400 — brief needs 10+ characters and a valid contact. Run `hire` again.</Err>);
        else if (res.status === 429) push(<Err>429 — rate limited, try again in a few minutes.</Err>);
        else {
          // Inbox not connected: don't lose the brief — hand it to the visitor's mail app, prefilled.
          const mail = mailtoLink(data.email, `Project brief from ${mode.data.name}`, `${input}\n\n— ${mode.data.name} (${mode.data.contact})\nSent from the ranasami.dev shell`);
          push(
            <Dim>{res.status} — inbox offline, so your brief is ready to send by email instead:</Dim>,
            <span>
              <a href={mail} onClick={(e) => e.stopPropagation()} className="rounded border border-accent/60 px-2 py-0.5 text-accent hover:bg-accent hover:text-black">
                ✉ send brief via email ↗
              </a>{" "}
              <Dim>(opens your mail app, prefilled)</Dim>
            </span>,
          );
        }
      } catch {
        push(<Err>network error — email {data.email}</Err>);
      } finally {
        setBusy(false);
      }
      return;
    }

    push(<Echo prompt={cwdLabel}>{input}</Echo>);
    if (!input) return;
    setHistory((h) => [input, ...h.filter((x) => x !== input)].slice(0, 50));

    const [head = "", ...rest] = input.split(/\s+/);
    const cmd = head.toLowerCase();
    const arg = rest.join(" ");

    switch (cmd) {
      case "help":
        push(
          <Dim>Available commands:</Dim>,
          ...Object.entries(COMMANDS).map(([name, c]) => (
            <span key={name}>
              <span className="inline-block w-40 text-accent">{c.usage}</span>
              <Dim>{c.desc}</Dim>
            </span>
          )),
        );
        break;

      case "man": {
        const c = COMMANDS[arg];
        if (!c) push(<Err>No manual entry for {arg || "(nothing)"}</Err>);
        else push(<span><span className="text-accent">NAME</span>  {arg} — {c.desc}</span>, <span><span className="text-accent">USAGE</span> {c.usage}</span>);
        break;
      }

      case "neofetch":
        push(
          <div className="flex gap-6 py-1">
            <pre className="text-accent [text-shadow:0_0_10px_rgba(0,255,65,0.5)]">{ASCII.join("\n")}</pre>
            <div className="space-y-0.5">
              <div>
                <span className="text-accent">guest</span>@<span className="text-accent">ranasami.dev</span>
              </div>
              <Dim>────────────────────</Dim>
              <Kv k="Name">{data.name}</Kv>
              <Kv k="Role">{data.role}</Kv>
              <Kv k="Host">{data.location} ({data.timezone})</Kv>
              <Kv k="Uptime">shipping since 2022 · {new Date().getFullYear() - 2022}+ yrs</Kv>
              <Kv k="Projects">{data.projects.length} ({data.projects.filter((p) => p.status === "Live").length} live)</Kv>
              <Kv k="Stack">{data.stack.slice(0, 5).map((s) => s.name).join(", ")}</Kv>
              <Kv k="Shell">rs-shell 2.0 · {Object.keys(COMMANDS).length} commands</Kv>
              <div className="flex gap-1 pt-1">
                {["#000", "#15803d", "#22c55e", "#4ade80", "#00ff41", "#b8ffc6", "#f5f1ea"].map((c) => (
                  <span key={c} className="inline-block h-3 w-5" style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>,
        );
        break;

      case "whoami":
        push(
          <span>
            <span className="text-accent">{data.name}</span> — {data.role}
          </span>,
          <Dim>{data.location} · builds real-time, AI-powered web products end to end.</Dim>,
        );
        break;

      case "pwd":
        push(<span>/home/guest{cwdLabel.slice(1)}</span>);
        break;

      case "ls": {
        const path = resolve(cwd, arg || ".");
        const node = lookup(fs, path);
        if (!node) push(<Err>ls: {arg}: No such file or directory</Err>);
        else if (node.type === "file") push(<span>{arg}</span>);
        else
          push(
            <span className="flex flex-wrap gap-x-6">
              {Object.entries(node.children).map(([name, child]) =>
                child.type === "dir" ? (
                  <span key={name} className="font-semibold text-accent">{name}/</span>
                ) : (
                  <span key={name}>{name}</span>
                ),
              )}
            </span>,
          );
        break;
      }

      case "cd": {
        const path = resolve(cwd, arg || "~");
        const node = lookup(fs, path);
        if (!node) push(<Err>cd: {arg}: No such file or directory</Err>);
        else if (node.type !== "dir") push(<Err>cd: {arg}: Not a directory</Err>);
        else setCwd(path);
        break;
      }

      case "cat": {
        if (!arg) return push(<Err>usage: cat &lt;file&gt; — try `cat about.md`</Err>);
        const node = lookup(fs, resolve(cwd, arg));
        if (!node) push(<Err>cat: {arg}: No such file or directory</Err>);
        else if (node.type === "dir") push(<Err>cat: {arg}: Is a directory — try `ls {arg}`</Err>);
        else push(<pre className="whitespace-pre-wrap text-text/90">{node.content}</pre>);
        break;
      }

      case "tree":
        push(<pre className="text-text/90">{["~", ...treeLines(fs)].join("\n")}</pre>, <Dim>{Object.keys((fs as { children: object }).children).length} entries at root</Dim>);
        break;

      case "projects":
        push(
          ...data.projects.map((p) => (
            <span key={p.slug}>
              <span className="inline-block w-44 text-accent">{p.slug}</span>
              <span className="text-text/90">{p.tagline}</span> <Status s={p.status} />
            </span>
          )),
          <Dim>→ open &lt;name&gt; · cat projects/&lt;name&gt;/README.md · ping &lt;name&gt;</Dim>,
        );
        break;

      case "open":
      case "visit": {
        const p = findProject(arg.toLowerCase());
        if (!p) return push(<Err>open: no such project “{arg}” — run `projects`</Err>);
        const live = p.links.find((l) => l.label === "Live")?.href;
        if (cmd === "open" && p.hasCase) {
          push(<span>opening case study → <span className="text-accent">/work/{p.slug}</span></span>);
          setTimeout(() => router.push(`/work/${p.slug}`), 450);
        } else if (live) {
          push(<span>launching <A href={live}>{live}</A></span>);
          window.open(live, "_blank", "noopener");
        } else push(<Dim>{p.name}: no public link yet.</Dim>);
        break;
      }

      case "grep": {
        if (!arg) return push(<Err>usage: grep &lt;tech&gt; — e.g. grep socket</Err>);
        const q = arg.toLowerCase();
        const hits = data.projects.filter((p) => [...p.stack, ...p.tech].some((s) => s.toLowerCase().includes(q)));
        if (!hits.length) push(<Dim>no projects match “{arg}”</Dim>);
        else
          push(
            ...hits.map((p) => {
              const match = [...p.stack, ...p.tech].find((s) => s.toLowerCase().includes(q))!;
              const i = match.toLowerCase().indexOf(q);
              return (
                <span key={p.slug}>
                  <span className="text-accent">projects/{p.slug}</span>:{" "}
                  {match.slice(0, i)}
                  <mark className="bg-accent px-0.5 text-black">{match.slice(i, i + q.length)}</mark>
                  {match.slice(i + q.length)}
                </span>
              );
            }),
            <Dim>{hits.length} match{hits.length > 1 ? "es" : ""}</Dim>,
          );
        break;
      }

      case "stack":
        push(
          ...data.stack.slice(0, 10).map((s) => {
            const n = Math.round(s.pct / 5);
            return (
              <span key={s.name}>
                <span className="inline-block w-32">{s.name}</span>
                <span className="text-accent">{"█".repeat(n)}</span>
                <span className="text-white/10">{"█".repeat(20 - n)}</span> <Dim>{s.pct}% · {s.count}/{data.projects.length}</Dim>
              </span>
            );
          }),
        );
        break;

      case "github": {
        setBusy(true);
        push(<Dim>GET https://api.github.com/users/{data.githubUser} …</Dim>);
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        try {
          const [u, r] = await Promise.all([
            fetch(`https://api.github.com/users/${data.githubUser}`, { signal: ctrl.signal }).then((x) => x.json()),
            fetch(`https://api.github.com/users/${data.githubUser}/repos?sort=pushed&per_page=6`, { signal: ctrl.signal }).then((x) => x.json()),
          ]);
          if (!Array.isArray(r)) throw new Error("rate limited");
          push(
            <Ok>200 OK · {u.public_repos} public repos · joined {new Date(u.created_at).getFullYear()}</Ok>,
            <Dim>recently pushed:</Dim>,
            ...r.map((repo: { name: string; language: string | null; pushed_at: string; html_url: string }) => (
              <span key={repo.name}>
                <A href={repo.html_url} className="inline-block w-56">{repo.name}</A>
                <span className="inline-block w-24 text-text/70">{repo.language ?? "—"}</span>
                <Dim>{timeAgo(repo.pushed_at)}</Dim>
              </span>
            )),
          );
        } catch (e) {
          push(<Err>{(e as Error).name === "AbortError" ? "^C aborted" : "github: API unavailable (rate limit?) — try again later"}</Err>);
        } finally {
          setBusy(false);
          abortRef.current = null;
        }
        break;
      }

      case "ping": {
        const p = findProject(arg.toLowerCase());
        const live = p?.links.find((l) => l.label === "Live")?.href;
        if (!p || !live) return push(<Err>ping: {arg || "(nothing)"}: no live host — try `ping brandly`</Err>);
        const host = new URL(live).host;
        setBusy(true);
        push(<span>PING {host} via HTTPS:</span>);
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        const times: number[] = [];
        try {
          for (let i = 0; i < 4; i++) {
            const t0 = performance.now();
            await fetch(`${live}/?ping=${Date.now()}`, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
            const ms = performance.now() - t0;
            times.push(ms);
            push(<span>reply from {host}: seq={i + 1} time=<span className="text-accent">{ms.toFixed(0)} ms</span></span>);
          }
          const avg = times.reduce((a, b) => a + b, 0) / times.length;
          push(<Dim>--- {host} ping statistics --- 4 sent, 4 received · min/avg/max = {Math.min(...times).toFixed(0)}/{avg.toFixed(0)}/{Math.max(...times).toFixed(0)} ms</Dim>);
        } catch (e) {
          push(<Err>{(e as Error).name === "AbortError" ? "^C" : `ping: ${host} unreachable`}</Err>);
        } finally {
          setBusy(false);
          abortRef.current = null;
        }
        break;
      }

      case "curl": {
        const path = arg.replace(/^-s\s+/, "");
        if (!["/api/hire", "/llms.txt"].includes(path)) return push(<Err>curl: sandbox allows /api/hire and /llms.txt only</Err>);
        setBusy(true);
        try {
          const t0 = performance.now();
          const res = await fetch(path, { cache: "no-store" });
          const ms = performance.now() - t0;
          const text = await res.text();
          const body = path === "/api/hire" ? JSON.stringify(JSON.parse(text), null, 2) : text.split("\n").slice(0, 14).join("\n") + "\n…";
          push(<Dim>HTTP/1.1 {res.status} {res.statusText || "OK"} · {res.headers.get("content-type")} · {ms.toFixed(0)} ms</Dim>, <pre className="whitespace-pre-wrap text-text/90">{body}</pre>);
        } catch {
          push(<Err>curl: request failed</Err>);
        } finally {
          setBusy(false);
        }
        break;
      }

      case "hire":
      case "sudo":
        if (cmd === "sudo" && arg !== "hire-me") return push(<Err>guest is not in the sudoers file. This incident will be reported. 🙂</Err>);
        push(
          cmd === "sudo" ? <Ok>[sudo] access granted</Ok> : null,
          <span>Let&apos;s do this. I&apos;ll ask 3 questions, then POST them to <span className="text-accent">/api/hire</span>.</span>,
          <Dim>Ctrl+C to cancel at any time.</Dim>,
        );
        setMode({ kind: "hire", step: 0, data: {} });
        break;

      case "contact":
        push(
          <span>email    <A href={`mailto:${data.email}`}>{data.email}</A></span>,
          <span>github   <A href={data.github}>{data.github.replace("https://", "")}</A></span>,
          <span>linkedin <A href={data.linkedin}>linkedin.com/in/rana-muhammad-sami</A></span>,
          <Dim>or run `hire` to send a brief right here.</Dim>,
        );
        break;

      case "cv":
        window.open(data.cv, "_blank");
        push(<Ok>downloading Rana_Muhammad_Sami_CV.pdf</Ok>);
        break;

      case "date":
        push(<span>{new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "medium", timeZone: "Asia/Karachi" }).format(new Date())} PKT</span>);
        break;

      case "echo":
        push(<span>{arg}</span>);
        break;

      case "history":
        push(...[...history].reverse().map((h, i) => <span key={i}><Dim>{String(i + 1).padStart(4)}</Dim>  {h}</span>));
        break;

      case "matrix":
        setMatrix(true);
        setTimeout(() => setMatrix(false), 4000);
        push(<Dim>wake up, guest…</Dim>);
        break;

      case "clear":
        setLines([]);
        break;

      case "exit":
        push(<Dim>there is no escape. try `hire` instead.</Dim>);
        break;

      case "rm":
        push(<Err>rm: permission denied — production is write-protected</Err>);
        break;

      default: {
        const guess = Object.keys(COMMANDS).find((c) => levenshtein(c, cmd) <= 2);
        push(<Err>command not found: {cmd}{guess ? ` — did you mean \`${guess}\`?` : ". type `help`."}</Err>);
      }
    }
  };

  /* ─────────── tab completion ─────────── */

  const completions = useMemo(() => {
    if (mode.kind !== "shell" || !value) return [];
    const parts = value.split(/\s+/);
    if (parts.length === 1) return Object.keys(COMMANDS).filter((c) => c.startsWith(parts[0]!.toLowerCase()));
    const [cmd, ...restParts] = parts;
    const partial = restParts.join(" ");
    if (["open", "ping", "visit"].includes(cmd!)) return data.projects.map((p) => p.slug).filter((s) => s.startsWith(partial));
    if (cmd === "man") return Object.keys(COMMANDS).filter((c) => c.startsWith(partial));
    if (["cd", "cat", "ls"].includes(cmd!)) {
      const slash = partial.lastIndexOf("/");
      const dirPart = slash >= 0 ? partial.slice(0, slash + 1) : "";
      const base = partial.slice(slash + 1);
      const dir = lookup(fs, resolve(cwd, dirPart || "."));
      if (!dir || dir.type !== "dir") return [];
      return Object.entries(dir.children)
        .filter(([n, c]) => n.startsWith(base) && (cmd !== "cd" || c.type === "dir"))
        .map(([n, c]) => dirPart + n + (c.type === "dir" ? "/" : ""));
    }
    return [];
  }, [value, mode, data, fs, cwd]);

  const ghost = completions.length === 1 ? completions[0]! : "";
  const lastToken = value.split(/\s+/).pop() ?? "";
  const ghostSuffix = ghost && ghost.startsWith(lastToken) ? ghost.slice(lastToken.length) : "";

  const complete = () => {
    if (!completions.length) return;
    const parts = value.split(/\s+/);
    if (completions.length === 1) {
      parts[parts.length - 1] = completions[0]!;
      setValue(parts.join(" ") + (parts.length === 1 || !completions[0]!.endsWith("/") ? " " : ""));
    } else {
      // show options and fill the common prefix
      push(<Echo prompt={cwdLabel}>{value}</Echo>, <span className="flex flex-wrap gap-x-5 text-text/80">{completions.map((c) => <span key={c}>{c}</span>)}</span>);
      const prefix = completions.reduce((a, b) => {
        let i = 0;
        while (i < a.length && a[i] === b[i]) i++;
        return a.slice(0, i);
      });
      parts[parts.length - 1] = prefix;
      setValue(parts.join(" "));
    }
  };

  const submit = (cmd: string) => {
    if (busy) return;
    void run(cmd);
    setValue("");
    setCursor(-1);
  };

  const prompt = mode.kind === "hire" ? `${HIRE_PROMPTS[mode.step]}:` : cwdLabel;
  const chips =
    mode.kind === "hire"
      ? []
      : cwd[0] === "projects"
        ? ["ls", "cat README.md", "cd ~", "tree"]
        : ["neofetch", "projects", "cat about.md", "github", "ping brandly", "grep socket", "hire"];

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-2xl border border-line-strong bg-[#030805] shadow-[0_0_80px_-20px_rgba(0,255,65,0.3)]"
      onClick={() => (booted ? inputRef.current?.focus() : boot(true))}
      onFocus={() => boot(true)}
      tabIndex={booted ? -1 : 0}
    >
      {/* title bar */}
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-accent/80" />
        </span>
        <span className="font-mono text-[11px] text-muted-soft">guest@ranasami.dev: {cwdLabel}</span>
        <span className="font-mono text-[10px] text-muted-soft">zsh</span>
      </div>

      {/* screen */}
      {/* screen — fixed height; content scrolls like a real shell */}
      <div
        ref={bodyRef}
        className="relative h-[220px] overflow-y-auto overscroll-contain p-3 font-mono text-[12px] leading-relaxed text-muted [scrollbar-color:rgba(0,255,65,0.35)_transparent] [scrollbar-width:thin] sm:h-[280px] sm:p-4 sm:text-[13px] md:h-[340px] md:p-5"
        aria-live="polite"
      >
        {lines.map((l) => (
          <div key={l.id}>{l.node}</div>
        ))}
        {busy && (
          <div className="text-accent">
            <Spinner /> <Dim>working… (Ctrl+C to abort)</Dim>
          </div>
        )}
        {booted && (
          <form
            className="mt-1 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
          >
            <span className="shrink-0 text-accent">{mode.kind === "hire" ? "?" : "❯"}</span>
            <span className="shrink-0 text-accent-soft">{prompt}</span>
            <label htmlFor="term-input" className="sr-only">
              Terminal command
            </label>
            <span className="relative flex-1">
              <input
                id="term-input"
                ref={inputRef}
                value={value}
                disabled={busy}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    complete();
                  } else if (e.key === "ArrowRight" && ghostSuffix && e.currentTarget.selectionStart === value.length) {
                    e.preventDefault();
                    setValue(value + ghostSuffix);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const next = Math.min(cursor + 1, history.length - 1);
                    if (history[next] !== undefined) {
                      setCursor(next);
                      setValue(history[next]!);
                    }
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const next = cursor - 1;
                    setCursor(Math.max(next, -1));
                    setValue(next >= 0 ? history[next]! : "");
                  } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
                    e.preventDefault();
                    setLines([]);
                  } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
                    e.preventDefault();
                    abortRef.current?.abort();
                    if (mode.kind === "hire") {
                      setMode({ kind: "shell" });
                      push(<Dim>^C — hire cancelled</Dim>);
                    } else push(<Echo prompt={cwdLabel}>{value + "^C"}</Echo>);
                    setValue("");
                  }
                }}
                autoComplete="off"
                spellCheck={false}
                placeholder={mode.kind === "hire" ? "" : "type help"}
                className="w-full bg-transparent text-text caret-accent outline-none placeholder:text-muted-soft/50"
              />
              {/* ghost completion */}
              {ghostSuffix && (
                <span className="pointer-events-none absolute left-0 top-0 whitespace-pre text-white/25" aria-hidden>
                  <span className="invisible">{value}</span>
                  {ghostSuffix}
                </span>
              )}
            </span>
          </form>
        )}
        {matrix && <MatrixRain />}
      </div>

      {/* quick commands */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                boot(true);
                submit(c);
              }}
              className="rounded-md border border-line px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* status bar (tmux-style) */}
      <div className="flex items-center justify-between bg-accent/10 font-mono text-[10px] uppercase tracking-wider">
        <div className="flex">
          <span className="bg-accent px-2.5 py-1 font-semibold text-black">{mode.kind === "hire" ? "HIRE" : busy ? "BUSY" : "NORMAL"}</span>
          <span className="px-2.5 py-1 text-accent">{cwdLabel}</span>
        </div>
        <div className="flex text-muted-soft">
          <span className="px-2.5 py-1">tab: complete · ↑ history · ^C cancel</span>
          <span className="bg-white/5 px-2.5 py-1 text-text">LHR {clock}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── small pieces ─────────────────────────── */

const K = ({ children }: { children: ReactNode }) => <b className="text-accent">{children}</b>;
const Dim = ({ children }: { children: ReactNode }) => <span className="text-muted-soft">{children}</span>;
const Err = ({ children }: { children: ReactNode }) => <span className="text-red-400">{children}</span>;
const Ok = ({ children }: { children: ReactNode }) => (
  <span>
    <span className="text-accent">[ OK ]</span> {children}
  </span>
);
const Kv = ({ k, children }: { k: string; children: ReactNode }) => (
  <div>
    <span className="text-accent">{k}</span>: {children}
  </div>
);
const A = ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
  <a href={href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className={`text-accent underline-offset-2 hover:underline ${className ?? ""}`}>
    {children}
  </a>
);
const Echo = ({ prompt, children }: { prompt: string; children: ReactNode }) => (
  <div className="mt-2">
    <span className="text-accent">❯</span> <span className="text-accent-soft">{prompt}</span> <span className="text-text">{children}</span>
  </div>
);
const Status = ({ s }: { s: string }) => <span className={s === "Live" ? "text-accent" : "text-muted-soft"}>[{s}]</span>;

function Spinner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % 10), 80);
    return () => clearInterval(id);
  }, []);
  return <span>{"⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"[i]}</span>;
}

function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    c.width = c.clientWidth;
    c.height = c.clientHeight;
    const cols = Math.floor(c.width / 14);
    const drops = Array.from({ length: cols }, () => Math.random() * -20);
    const glyphs = "アイウエオカキクケコサシスセソ0123456789ABCDEF";
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(3,8,5,0.18)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = "14px monospace";
      drops.forEach((y, i) => {
        ctx.fillStyle = Math.random() > 0.95 ? "#d1ffd9" : "#00ff41";
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)]!, i * 14, y * 14);
        drops[i] = y * 14 > c.height && Math.random() > 0.97 ? 0 : y + 1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 size-full" aria-hidden />;
}

function mailtoLink(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const units: [number, string][] = [[86400 * 30, "mo"], [86400, "d"], [3600, "h"], [60, "m"]];
  for (const [secs, label] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  return "just now";
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length]![b.length]!;
}
