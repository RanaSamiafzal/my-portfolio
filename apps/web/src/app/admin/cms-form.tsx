"use client";

import { useActionState, useState, type ReactNode } from "react";
import type { CmsState } from "./cms-actions";

const initial: CmsState = {};

export function CmsForm({
  action,
  children,
  className,
}: {
  action: (prev: CmsState, formData: FormData) => Promise<CmsState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form action={formAction} className={className}>
      {children}
      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button type="submit" disabled={pending} className="btn-cream disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
        {state.ok && <p className="font-mono text-xs text-accent">Saved.</p>}
        {state.error && <p className="font-mono text-xs text-red-400">{state.error}</p>}
      </div>
    </form>
  );
}

export function Field({
  label,
  name,
  defaultValue = "",
  type = "text",
  rows,
  hint,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  rows?: number;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mono-label">{label}</span>
      {hint && <span className="ml-2 font-mono text-[10px] text-muted-soft">{hint}</span>}
      {rows ? (
        <textarea
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="mt-2 w-full rounded-xl border border-line bg-black/40 px-4 py-3 text-sm text-text outline-none focus:border-accent"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="mt-2 w-full rounded-xl border border-line bg-black/40 px-4 py-3 text-text outline-none focus:border-accent"
        />
      )}
    </label>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-line bg-white/[0.02] p-5">
      <legend className="px-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{title}</legend>
      {children}
    </fieldset>
  );
}

/** One value per line (or comma-separated). Submitted as a single textarea. */
export function LinesField({
  label,
  name,
  values,
  hint,
  rows = 4,
}: {
  label: string;
  name: string;
  values: string[];
  hint?: string;
  rows?: number;
}) {
  return (
    <Field
      label={label}
      name={name}
      defaultValue={values.join("\n")}
      rows={rows}
      hint={hint ?? "One per line"}
    />
  );
}

type ListEditorProps<T> = {
  name: string;
  items: T[];
  blank: () => T;
  addLabel: string;
  render: (item: T, index: number, remove: () => void) => ReactNode;
};

/** Client-side add/remove rows; each render must emit named inputs with `name_${index}_…`. */
export function ListEditor<T>({ name, items, blank, addLabel, render }: ListEditorProps<T>) {
  const [rows, setRows] = useState(items.length ? items : [blank()]);
  const [epoch, setEpoch] = useState(0);

  return (
    <div className="space-y-4">
      <input type="hidden" name={`${name}_count`} value={rows.length} />
      {rows.map((item, i) => (
        <div key={`${epoch}-${i}`} className="relative space-y-3 rounded-xl border border-line bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-soft">
              #{String(i + 1).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => {
                setRows((r) => (r.length <= 1 ? r : r.filter((_, j) => j !== i)));
                setEpoch((e) => e + 1);
              }}
              className="font-mono text-[10px] text-muted hover:text-red-400"
            >
              Remove
            </button>
          </div>
          {render(item, i, () => {
            setRows((r) => (r.length <= 1 ? r : r.filter((_, j) => j !== i)));
            setEpoch((e) => e + 1);
          })}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((r) => [...r, blank()])}
        className="rounded-lg border border-dashed border-line px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:border-accent hover:text-accent"
      >
        + {addLabel}
      </button>
    </div>
  );
}
