import { useState } from "react";
export function GuestbookSignIn({ providers }: { providers: string[] }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  if (!providers.length) return <p className="text-sm text-muted">Social sign in is unavailable. You can still read the guestbook below.</p>;
  return <div className="flex flex-wrap gap-3">
    {providers.map((provider) => <button key={provider} type="button" className="btn-outline" disabled={pending !== null} onClick={async () => {
      setError(""); setPending(provider);
      try {
        const response = await fetch("/api/auth/csrf");
        const { csrfToken } = await response.json();
        if (!response.ok || !csrfToken) throw new Error();
        const form = document.createElement("form");
        form.method = "POST"; form.action = `/api/auth/signin/${provider}`;
        for (const [name, value] of Object.entries({ csrfToken, callbackUrl: `${window.location.origin}/guestbook` })) {
          const input = document.createElement("input"); input.type = "hidden"; input.name = name; input.value = String(value); form.append(input);
        }
        document.body.append(form); form.submit();
      } catch { setError("Sign in is unavailable. Please try again."); setPending(null); }
    }}>{pending === provider ? "Connecting…" : `Sign in with ${provider === "github" ? "GitHub" : "Google"}`}</button>)}
    {error && <p role="alert" className="w-full text-sm text-red-300">{error}</p>}
  </div>;
}
