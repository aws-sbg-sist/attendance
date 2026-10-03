import assert from "node:assert/strict";
import test from "node:test";
import { createGateCookie, readGateCookie } from "../apps/web/lib/gate-session.mjs";

test("accepts a signed gate cookie for the expected event", () => {
  const cookie = createGateCookie("aws-cloud-workshop", "valid", 60);
  assert.equal(readGateCookie(cookie, "aws-cloud-workshop"), "valid");
});

test("rejects a signed gate cookie for another event", () => {
  const cookie = createGateCookie("aws-cloud-workshop", "valid", 60);
  assert.equal(readGateCookie(cookie, "upcoming-event"), "missing");
});

test("rejects a tampered gate cookie", () => {
  const cookie = createGateCookie("aws-cloud-workshop", "valid", 60);
  assert.equal(readGateCookie(`${cookie}tampered`, "aws-cloud-workshop"), "missing");
});
