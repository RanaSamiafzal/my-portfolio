import { ImageResponse } from "next/og";
import { profile } from "@repo/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — ${profile.role}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#000",
          backgroundImage: "radial-gradient(rgba(134,239,172,0.16) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          color: "#f5f1ea",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", color: "#00ff41", fontSize: 26, letterSpacing: 4 }}>RANASAMI.DEV · AVAILABLE FOR WORK</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, color: "#00ff41" }}>{profile.name}</div>
          <div style={{ fontSize: 68, lineHeight: 1.05, marginTop: 16, fontFamily: "sans-serif", maxWidth: 1000 }}>{profile.headline}</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "rgba(245,241,234,0.6)" }}>Next.js · React · Node · Socket.IO · Postgres · AI</div>
      </div>
    ),
    size,
  );
}
