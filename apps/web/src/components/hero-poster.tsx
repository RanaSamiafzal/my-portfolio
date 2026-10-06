/** CSS-only green duotone portrait — used on mobile / until WebGL boots. */
export function HeroPoster({
  src,
  matte,
  className,
}: {
  src: string;
  matte: string;
  className?: string;
}) {
  // Higher focus = less empty black above the head on phones.
  const fit = {
    backgroundSize: "cover",
    backgroundPosition: "40% 22%",
    backgroundRepeat: "no-repeat",
  } as const;

  return (
    <div className={className} style={{ perspective: "900px" }} aria-hidden>
      <div
        className="absolute inset-0 origin-[48%_60%]"
        style={{
          transform: "rotateZ(2deg) rotateX(-1deg) rotateY(-2deg) scale(1.08)",
        }}
      >
        <div className="absolute inset-0 max-lg:[mask-image:linear-gradient(90deg,transparent_0%,#000_10%,#000_100%)] lg:[mask-image:linear-gradient(90deg,transparent,#000_30%),linear-gradient(0deg,transparent,#000_12%)] lg:[mask-composite:intersect] lg:[-webkit-mask-composite:source-in]">
          <div
            className="absolute inset-0"
            style={{
              ...fit,
              backgroundImage: `url(${src})`,
              WebkitMaskImage: `url(${matte})`,
              maskImage: `url(${matte})`,
              WebkitMaskSize: "cover",
              maskSize: "cover",
              WebkitMaskPosition: "40% 22%",
              maskPosition: "40% 22%",
              filter: "grayscale(1) sepia(1) hue-rotate(72deg) saturate(4.5) brightness(0.62) contrast(1.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
