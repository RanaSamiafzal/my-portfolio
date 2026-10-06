"use client";

import { useState } from "react";
import { profile } from "@repo/content";
import { Pill, cn } from "@repo/ui";

const interests = ["Full-time role", "Contract", "Freelance build", "Just saying hi"];

type State = {
  status: "idle" | "sending" | "sent" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  /** Prefilled mailto link offered when the inbox (database) is offline. */
  mailto?: string;
};

const TO = profile.email;

const inputClass =
  "w-full rounded-xl border border-line-strong bg-black/50 px-4 py-3 text-text placeholder:text-muted-soft/60 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/10";

export function ContactForm() {
  const [interest, setInterest] = useState(interests[0]!);
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, interest }),
      });
      const json = await res.json();
      if (!res.ok) {
        const d = data as Record<string, string>;
        const mailto =
          res.status === 503
            ? `mailto:${TO}?subject=${encodeURIComponent(`${interest} — ${d.name ?? ""}`)}&body=${encodeURIComponent(
                `${d.message ?? ""}\n\n— ${d.name ?? ""} (${d.email ?? ""})${d.company ? `, ${d.company}` : ""}`,
              )}`
            : undefined;
        setState({
          status: "error",
          message: res.status === 503 ? "The inbox isn't connected yet — your message is ready to send by email instead." : json.error,
          fieldErrors: json.fieldErrors,
          mailto,
        });
        return;
      }
      form.reset();
      setState({ status: "sent" });
    } catch {
      setState({ status: "error", message: "Network error — please try again or email me directly." });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="py-16 text-center">
        <p className="font-mono text-sm text-accent">MESSAGE RECEIVED ✓</p>
        <p className="mt-4 font-medium text-3xl">Thanks — I&apos;ll get back to you soon.</p>
        <button type="button" onClick={() => setState({ status: "idle" })} className="mt-8 font-mono text-xs text-muted hover:text-accent">
          SEND ANOTHER →
        </button>
      </div>
    );
  }

  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-muted-soft">
        <span>Start a conversation</span>
        <span className="normal-case tracking-normal">* required</span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Name *</span>
          <input name="name" required autoComplete="name" placeholder="Ada Lovelace" className={inputClass} />
          {err("name") && <span className="mt-1 block text-xs text-red-400">{err("name")}</span>}
        </label>
        <label className="block">
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Email *</span>
          <input name="email" type="email" required autoComplete="email" placeholder="ada@company.com" className={inputClass} />
          {err("email") && <span className="mt-1 block text-xs text-red-400">{err("email")}</span>}
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Company</span>
        <input name="company" autoComplete="organization" placeholder="Optional" className={inputClass} />
      </label>
      <fieldset>
        <legend className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">I&apos;m interested in</legend>
        <div className="flex flex-wrap gap-2">
          {interests.map((i) => (
            <Pill key={i} active={interest === i} onClick={() => setInterest(i)}>
              {i}
            </Pill>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Message *</span>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="What are you building, what does success look like, and when do you need it?"
          className={cn(inputClass, "resize-y")}
        />
        {err("message") && <span className="mt-1 block text-xs text-red-400">{err("message")}</span>}
      </label>
      {/* Honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.status === "error" && state.message && (
        <div className="space-y-3">
          <p className={state.mailto ? "text-sm text-muted" : "text-sm text-red-400"}>{state.message}</p>
          {state.mailto && (
            <a href={state.mailto} className="btn-outline">
              ✉ Send via email (prefilled) ↗
            </a>
          )}
        </div>
      )}
      <button
        type="submit"
        disabled={state.status === "sending"}
        className="btn-primary disabled:opacity-60"
      >
        {state.status === "sending" ? "Sending…" : "Send message →"}
      </button>
    </form>
  );
}
