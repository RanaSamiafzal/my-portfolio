"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BrowserFrame } from "@/components/project-visual";

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
  folder?: "projects" | "profile" | "hero" | "misc";
  hint?: string;
  /** Show the same browser chrome frame used on the public site */
  previewFrame?: boolean;
  chromeUrl?: string;
  aspect?: "video" | "square";
};

export function ImageUploadField({
  name,
  label,
  defaultValue = "",
  folder = "misc",
  hint,
  previewFrame = false,
  chromeUrl = "preview",
  aspect = "video",
}: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setStatus("uploading");
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed");
      setUrl(json.url);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  const aspectClass = aspect === "square" ? "aspect-square" : "aspect-video";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="block min-w-0 flex-1">
          <span className="mono-label">{label}</span>
          {hint && <span className="ml-2 font-mono text-[10px] text-muted-soft">{hint}</span>}
          <input
            name={name}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Upload or paste a URL /public path"
            className="mt-2 w-full rounded-xl border border-line bg-black/40 px-4 py-3 font-mono text-sm text-text outline-none focus:border-accent"
          />
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={status === "uploading"}
            onClick={() => inputRef.current?.click()}
            className="btn-outline disabled:opacity-60"
          >
            {status === "uploading" ? "Uploading…" : "Upload"}
          </button>
          {url && (
            <button type="button" onClick={() => setUrl("")} className="font-mono text-[11px] text-muted hover:text-red-400">
              Clear
            </button>
          )}
        </div>
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      {url &&
        (previewFrame ? (
          <BrowserFrame url={chromeUrl} className="max-w-xl">
            <div className={`relative ${aspectClass} bg-black`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview; remote or local */}
              <img src={url} alt="Preview" className="absolute inset-0 h-full w-full object-cover object-top" />
            </div>
          </BrowserFrame>
        ) : (
          <div className={`relative max-w-xs overflow-hidden rounded-xl border border-line ${aspectClass}`}>
            <Image src={url} alt="Preview" fill className="object-cover" unoptimized={url.startsWith("http")} sizes="320px" />
          </div>
        ))}
    </div>
  );
}
