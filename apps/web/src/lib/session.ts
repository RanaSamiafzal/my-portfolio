import type { AstroCookies } from "astro";
import { getToken } from "@auth/core/jwt";
import { authSecret } from "./auth-secret";
import { OAUTH_COOKIE } from "./oauth";

export const SESSION_COOKIE = "portfolio.session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  image?: string;
};

const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function b64url(data: ArrayBuffer | Uint8Array | string) {
  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : data instanceof Uint8Array
        ? data
        : new Uint8Array(data);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string) {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(payload: SessionUser & { exp: number }) {
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(await crypto.subtle.sign("HMAC", await hmacKey(), new TextEncoder().encode(body)));
  return `${body}.${sig}`;
}

async function verify(token: string): Promise<SessionUser | null> {
  try {
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra) return null;
  const ok = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(),
    fromB64url(sig),
    new TextEncoder().encode(body),
  );
  if (!ok) return null;
    const json = JSON.parse(new TextDecoder().decode(fromB64url(body))) as SessionUser & { exp: number };
    if (!Number.isFinite(json.exp) || json.exp <= Date.now() / 1000 || !json.id || typeof json.email !== "string") return null;
    return { id: json.id, email: json.email, name: json.name, isAdmin: Boolean(json.isAdmin) };
  } catch {
    return null;
  }
}

function cookieOpts(maxAge = MAX_AGE_SEC) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}

export async function createSession(
  cookies: AstroCookies,
  user: SessionUser,
) {
  const token = await sign({ ...user, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC });
  cookies.set(SESSION_COOKIE, token, cookieOpts());
}

export async function getSession(
  cookiesOrRequest: AstroCookies | Request,
): Promise<SessionUser | null> {
  try {
  let raw: string | undefined;
  let cookieHeader = "";
  if (cookiesOrRequest instanceof Request) {
    cookieHeader = cookiesOrRequest.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/(?:^|;\s*)portfolio\.session=([^;]+)/);
    raw = match?.[1] ? decodeURIComponent(match[1]) : undefined;
  } else {
    raw = cookiesOrRequest.get(SESSION_COOKIE)?.value;
    cookieHeader = [OAUTH_COOKIE, ...Array.from({ length: 12 }, (_, i) => `${OAUTH_COOKIE}.${i}`)]
      .flatMap((name) => {
        const value = cookiesOrRequest.get(name)?.value;
        return value ? [`${name}=${value}`] : [];
      }).join("; ");
  }
  if (raw) {
    const admin = await verify(raw);
    if (admin) return admin;
  }
  if (!cookieHeader.includes(`${OAUTH_COOKIE}=`) && !cookieHeader.includes(`${OAUTH_COOKIE}.0=`)) return null;
  const token = await getToken({ req: { headers: new Headers({ cookie: cookieHeader }) }, secret: authSecret(), cookieName: OAUTH_COOKIE });
  if (!token?.email || !token.sub) return null;
  return { id: token.sub, email: token.email, name: token.name || token.email, image: token.picture ?? undefined, isAdmin: token.isAdmin === true };
  } catch { return null; }
}

export function destroySession(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, { path: "/" });
  for (const name of [OAUTH_COOKIE, ...Array.from({ length: 12 }, (_, i) => `${OAUTH_COOKIE}.${i}`)]) {
    cookies.delete(name, { path: "/" });
  }
}
