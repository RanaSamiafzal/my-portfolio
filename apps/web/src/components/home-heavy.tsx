import { lazy, Suspense, type ComponentProps } from "react";

const Terminal = lazy(() => import("./terminal").then((module) => ({ default: module.Terminal })));

export function HomeTerminal(props: ComponentProps<typeof Terminal>) {
  return <Suspense fallback={<div className="min-h-64 rounded-2xl border border-line bg-bg-1 p-4 text-sm text-muted" role="status">Loading portfolio shell…</div>}><Terminal {...props} /></Suspense>;
}
