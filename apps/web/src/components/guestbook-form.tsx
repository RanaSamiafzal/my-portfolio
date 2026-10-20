import { useState } from "react";
export function GuestbookForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return <form className="my-4 space-y-4" onSubmit={async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true); setError("");
    try {
      const response = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: form.get("body") }) });
      const result = await response.json();
      if (!response.ok) setError(result.error || "Could not save your note.");
      else window.location.reload();
    } catch { setError("Request failed. Try again."); } finally { setPending(false); }
  }}>
    <label className="block text-sm" htmlFor="guestbook-body">Your note</label>
    <textarea id="guestbook-body" name="body" required minLength={2} maxLength={280} rows={4} className="w-full rounded-xl border border-line bg-bg-1 p-4" />
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    <button disabled={pending} className="btn-cream disabled:opacity-60">{pending ? "Saving…" : "Sign the guestbook"}</button>
  </form>;
}
