import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  children?: ReactNode;
  replace?: boolean;
  prefetch?: boolean;
  scroll?: boolean;
};

/** Drop-in for next/link in the Astro app. */
export default function Link({ href, children, replace: _r, prefetch: _p, scroll: _s, ...rest }: Props) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
