import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[70dvh] place-items-center text-center">
      <div>
        <p className="font-mono text-sm text-accent">ERR_404 · ROUTE_NOT_FOUND</p>
        <h1 className="mt-4 h-display text-[clamp(3rem,10vw,8rem)] text-accent [text-shadow:0_0_30px_rgba(0,255,65,0.5)]">404</h1>
        <p className="mt-4 text-muted">That page doesn&apos;t exist — or it shipped somewhere else.</p>
        <Link href="/" className="btn-cream mt-8">
          Back home
        </Link>
      </div>
    </div>
  );
}
