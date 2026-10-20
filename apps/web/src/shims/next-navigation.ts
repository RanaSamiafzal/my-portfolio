"use client";

import { useCallback, useEffect, useState } from "react";

export function usePathname() {
  const [pathname, setPathname] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  );

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return pathname;
}

export function useRouter() {
  return {
    push(href: string) {
      window.location.assign(href);
    },
    replace(href: string) {
      window.location.replace(href);
    },
    refresh() {
      window.location.reload();
    },
    back() {
      window.history.back();
    },
    prefetch: useCallback((_href: string) => undefined, []),
  };
}

export function redirect(href: string): never {
  throw new Response(null, { status: 302, headers: { Location: href } });
}

export function notFound(): never {
  throw new Response(null, { status: 404 });
}
