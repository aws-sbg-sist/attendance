import { createHmac, timingSafeEqual } from "node:crypto";

export const GATE_COOKIE_NAME = "attendance_event_gate";

function gateSecret() {
  const configured = process.env.TOKEN_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return "local-development-gate-secret-not-for-production";
  throw new Error("TOKEN_SECRET is required");
}

function signature(payload) {
  return createHmac("sha256", gateSecret()).update(payload).digest("base64url");
}

export function createGateCookie(eventSlug, state, maxAgeSeconds) {
  const payload = Buffer.from(
    JSON.stringify({ eventSlug, state, expiresAt: Date.now() + maxAgeSeconds * 1000 }),
  ).toString("base64url");

  return `${payload}.${signature(payload)}`;
}

export function readGateCookie(value, expectedEventSlug) {
  if (!value) return "missing";

  try {
    const [payload, suppliedSignature, extra] = value.split(".");
    if (!payload || !suppliedSignature || extra) return "missing";

    const expectedSignature = signature(payload);
    const supplied = Buffer.from(suppliedSignature);
    const expected = Buffer.from(expectedSignature);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return "missing";

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decoded.eventSlug !== expectedEventSlug || decoded.expiresAt <= Date.now()) return "missing";
    if (!["valid", "expired", "invalid", "wrong-event"].includes(decoded.state)) return "missing";

    return decoded.state;
  } catch {
    return "missing";
  }
}
