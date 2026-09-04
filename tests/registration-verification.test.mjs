import assert from "node:assert/strict";
import test from "node:test";
import { verifyFixtureRegistration } from "../modules/checkin-experience/src/server/fixtures.mjs";

test("verifies a valid event registration", async () => {
  const result = await verifyFixtureRegistration("aws-cloud-workshop", "AWS001");

  assert.deepEqual(result, { ok: true, participantName: "Ananya Rao" });
});

test("preserves registration IDs with leading zeroes", async () => {
  const result = await verifyFixtureRegistration("aws-cloud-workshop", "00125");

  assert.deepEqual(result, { ok: true, participantName: "Karthik S" });
});

test("returns one generic failure shape for an invalid or wrong-event ID", async () => {
  const invalid = await verifyFixtureRegistration("aws-cloud-workshop", "DISABLED001");
  const wrongEvent = await verifyFixtureRegistration("upcoming-event", "AWS001");

  assert.deepEqual(invalid, { ok: false });
  assert.deepEqual(wrongEvent, { ok: false });
});

test("reports fixture service failures without returning participant data", async () => {
  await assert.rejects(
    verifyFixtureRegistration("aws-cloud-workshop", "ERROR001"),
    /Fixture service unavailable/,
  );
});
