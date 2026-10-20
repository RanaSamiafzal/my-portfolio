import assert from "node:assert/strict";
import { NodeApp } from "astro/app/node";

process.env.NODE_ENV = "production";
process.env.VERCEL_URL = "my-portfolio-origin-test-ranasamiafzals-projects.vercel.app";
const { default: config } = await import("../apps/web/astro.config.mjs");
const allowedDomains = config.security.allowedDomains;
const request = (headers, domains = allowedDomains) => NodeApp.createRequest({
  method: "POST", url: "/api/auth/login", headers, socket: { encrypted: false },
}, { skipBody: true, allowedDomains: domains });

const canonical = "rana-muhammad-sami.vercel.app";
const originalHeaders = { host: canonical, "x-forwarded-proto": "https", origin: `https://${canonical}` };
assert.equal(new URL(request(originalHeaders, []).url).origin, "https://localhost", "Reproduce the previous deployment failure");
for (const hostname of [canonical, "my-portfolio-peach-three-14.vercel.app", process.env.VERCEL_URL]) {
  for (const host of [hostname, "localhost"]) {
    const headers = { host, "x-forwarded-host": hostname, "x-forwarded-proto": "https", origin: `https://${hostname}` };
    const req = request(headers);
    assert.equal(new URL(req.url).origin, headers.origin, `Public origin resolves through the proxy: ${hostname}`);
  }
}
const foreign = request({ ...originalHeaders, origin: "https://attacker.example", "x-forwarded-host": "attacker.example" });
assert.equal(new URL(foreign.url).origin, `https://${canonical}`, "Untrusted forwarded host is ignored");
assert.notEqual(foreign.headers.get("origin"), new URL(foreign.url).origin, "Existing origin guards reject foreign requests");
assert.equal(new URL(request({ host: "attacker.example", "x-forwarded-host": "attacker.example", "x-forwarded-proto": "https" }).url).hostname, "localhost");
assert.ok(allowedDomains.every(pattern => !pattern.hostname.includes("*")), "No broad host wildcard");
console.log("PASS: reproduce old localhost mismatch, production aliases, deployment URL, reverse proxy, and foreign-host/origin rejection");
