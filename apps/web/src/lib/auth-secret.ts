import { randomBytes } from "node:crypto";

const developmentSecret = randomBytes(32).toString("base64url");
export function authSecret() {
  const value = process.env.AUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is required in production.");
  return developmentSecret;
}
