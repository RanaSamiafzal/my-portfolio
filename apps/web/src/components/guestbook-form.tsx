"use client";

import { useActionState, useEffect, useRef } from "react";
import { postEntry, type GuestbookState } from "@/app/guestbook/actions";

export function GuestbookForm() {
  const [state, action, pending] = useActionState<GuestbookState, FormData>(postEntry, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="gb-body">Your message</label>
      <input
        id="gb-body"
        name="body"
        maxLength={280}
        required
        placeholder="Leave a note, a kind word or a bug report…"
        className="flex-1 rounded-xl border border-line-strong bg-black/50 px-4 py-3 text-text outline-none placeholder:text-muted-soft/60 focus:border-accent focus:ring-4 focus:ring-accent/10"
      />
      <button
        type="submit"
        disabled={pending}
        className="btn-primary justify-center disabled:opacity-60"
      >
        {pending ? "Signing…" : "Sign →"}
      </button>
      {state.error && <p className="text-sm text-red-400 sm:basis-full">{state.error}</p>}
    </form>
  );
}
