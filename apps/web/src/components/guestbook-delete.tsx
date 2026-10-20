import { useState } from "react";
export function GuestbookDelete({ id }: { id: number }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return <div><button type="button" className="min-h-11 text-sm text-accent disabled:opacity-60" disabled={pending} onClick={async () => {
    setPending(true); setError("");
    try {
      const res = await fetch("/api/guestbook", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const result = await res.json();
      if (!res.ok) setError(result.error || "Delete failed."); else window.location.reload();
    } catch { setError("Request failed. Try again."); } finally { setPending(false); }
  }}>{pending ? "Deleting…" : "Delete entry"}</button>{error && <p role="alert" className="text-sm text-red-300">{error}</p>}</div>;
}
