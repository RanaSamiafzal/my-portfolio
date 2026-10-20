import { useState } from "react";
import { actions } from "astro:actions";
export function MutationButton({ action, values, children }: {
  action: "deleteProject" | "updateMessage";
  values: Record<string, string>;
  children: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return <div>
    <button type="button" disabled={pending} className="min-h-11 rounded-lg px-3 py-2 text-sm text-accent hover:bg-bg-2 disabled:opacity-60" onClick={async () => {
      setPending(true); setError("");
      try {
        const form = new FormData();
        for (const [key, value] of Object.entries(values)) form.set(key, value);
        const result = await actions[action](form);
        if (result.error) setError(result.error.message);
        else if (result.data.error) setError(result.data.error);
        else window.location.reload();
      } catch { setError("Request failed. Please try again."); }
      finally { setPending(false); }
    }}>{pending ? "Working…" : children}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
  </div>;
}
