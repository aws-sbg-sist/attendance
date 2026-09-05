import assert from "node:assert/strict";
import test from "node:test";
import { parseCheckInRequest } from "../apps/web/lib/check-in-request.mjs";

test("accepts a minimal granted location", () => {
  assert.deepEqual(parseCheckInRequest({
    registrationId: " AWS001 ",
    location: { status: "granted", latitude: 12.8729, longitude: 80.2184, accuracy: 20 },
  }), {
    registrationId: "AWS001",
    location: { status: "granted", latitude: 12.8729, longitude: 80.2184, accuracy: 20 },
  });
});

test("accepts denied, unavailable, and disabled location results", () => {
  assert.deepEqual(parseCheckInRequest({ registrationId: "AWS001", location: { status: "denied" } }), {
    registrationId: "AWS001", location: { status: "denied" },
  });
  assert.deepEqual(parseCheckInRequest({ registrationId: "AWS001", location: { status: "unavailable" } }), {
    registrationId: "AWS001", location: { status: "unavailable" },
  });
  assert.deepEqual(parseCheckInRequest({ registrationId: "AWS001", location: null }), {
    registrationId: "AWS001", location: null,
  });
});

test("rejects malformed IDs and coordinates", () => {
  assert.equal(parseCheckInRequest({ registrationId: "", location: null }), null);
  assert.equal(parseCheckInRequest({ registrationId: "AWS001", location: { status: "granted", latitude: 91, longitude: 80, accuracy: 5 } }), null);
  assert.equal(parseCheckInRequest({ registrationId: "AWS001", location: { status: "granted", latitude: 12, longitude: 181, accuracy: 5 } }), null);
  assert.equal(parseCheckInRequest({ registrationId: "AWS001", location: { status: "granted", latitude: 12, longitude: 80, accuracy: -1 } }), null);
});
