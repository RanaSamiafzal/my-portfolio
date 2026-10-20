import type { ComponentPropsWithoutRef, CSSProperties } from "react";

type Props = Omit<ComponentPropsWithoutRef<"img">, "src" | "width" | "height"> & {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
  sizes?: string;
  quality?: number;
};

/** Drop-in for next/image — plain img (remote URLs stay unoptimized). */
export default function Image({
  src,
  alt,
  width,
  height,
  fill,
  priority,
  className,
  style,
  sizes,
  unoptimized: _unoptimized,
  quality: _quality,
  ...rest
}: Props) {
  const fillStyle: CSSProperties | undefined = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }
    : style;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={fillStyle}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...rest}
    />
  );
}
