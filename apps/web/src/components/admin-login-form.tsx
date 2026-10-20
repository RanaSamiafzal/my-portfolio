"use client";

import { useState } from "react";

export function AdminLoginForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setError(data.error || "Sign-in failed");
        setPending(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Network error — try again");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-4">
      <label className="block">
        <span className="mono-label">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={defaultEmail}
          className="mt-2 w-full rounded-xl border border-line bg-bg-1 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="mono-label">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-line bg-bg-1 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
        />
      </label>
      {error && <p className="font-mono text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={pending} className="btn-cream w-full justify-center disabled:opacity-60">
        {pending ? "Signing in…" : "Open inbox"}
      </button>
    </form>
  );
}
