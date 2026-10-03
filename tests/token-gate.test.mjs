import assert from "node:assert/strict";
import test from "node:test";
import { validateFixtureToken } from "../modules/checkin-experience/src/server/fixtures.mjs";

test("accepts a current token bound to the selected event", async () => {
  assert.equal(await validateFixtureToken("aws-cloud-workshop", "live-aws-token"), "valid");
});

test("requires a venue code when the ticket is missing", async () => {
  assert.equal(await validateFixtureToken("aws-cloud-workshop", undefined), "missing");
});

test("identifies an expired event code", async () => {
  assert.equal(await validateFixtureToken("aws-cloud-workshop", "expired-aws-token"), "expired");
});

test("rejects an unknown or tampered event code", async () => {
  assert.equal(await validateFixtureToken("aws-cloud-workshop", "tampered-token"), "invalid");
});

test("rejects a valid token belonging to another event", async () => {
  assert.equal(await validateFixtureToken("aws-cloud-workshop", "live-other-event"), "wrong-event");
});
