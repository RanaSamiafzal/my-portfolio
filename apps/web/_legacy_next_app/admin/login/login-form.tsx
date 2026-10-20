"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "../actions";

const initial: AdminLoginState = {};

export function AdminLoginForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, action, pending] = useActionState(adminLogin, initial);

  return (
    <form action={action} className="mt-10 space-y-4">
      <label className="block">
        <span className="mono-label">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={defaultEmail}
          className="mt-2 w-full rounded-xl border border-line bg-black/40 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="mono-label">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-line bg-black/40 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
        />
      </label>
      {state.error && <p className="font-mono text-sm text-red-400">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-cream w-full justify-center disabled:opacity-60">
        {pending ? "Signing in…" : "Open inbox"}
      </button>
    </form>
  );
}
