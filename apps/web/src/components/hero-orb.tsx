import Image from "next/image";

/** Hero visual — desk illustration with soft blend into the dark stage. */
export function HeroOrb({ className }: { className?: string }) {
  return (
    <div className={`hero-desk ${className ?? ""}`} aria-hidden>
      <Image
        src="/sami-illustration.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover object-[center_18%]"
      />
    </div>
  );
}
