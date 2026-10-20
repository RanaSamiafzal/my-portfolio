import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

type DynamicOptions = {
  ssr?: boolean;
  loading?: () => ReactNode;
};

/** Minimal next/dynamic stand-in using React.lazy. */
export default function dynamic<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T } | T | { [key: string]: T }>,
  options: DynamicOptions = {},
) {
  const Lazy = lazy(async () => {
    const mod = await loader();
    if (typeof mod === "function") return { default: mod as T };
    if (mod && typeof mod === "object" && "default" in mod) return mod as { default: T };
    const first = Object.values(mod as object)[0] as T;
    return { default: first };
  });

  function DynamicComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={options.loading ? options.loading() : null}>
        <Lazy {...props} />
      </Suspense>
    );
  }

  return DynamicComponent;
}
