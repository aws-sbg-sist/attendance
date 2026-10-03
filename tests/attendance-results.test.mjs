import assert from "node:assert/strict";
import test from "node:test";
import { submitFixtureAttendance } from "../modules/checkin-experience/src/server/fixtures.mjs";

test("returns server-owned confirmation fields after a successful check-in", async () => {
  const result = await submitFixtureAttendance("aws-cloud-workshop", "AWS001", {
    status: "granted",
    latitude: 12.8729,
    longitude: 80.2184,
    accuracy: 20,
  });

  assert.deepEqual(result, {
    status: "recorded",
    participantName: "Ananya Rao",
    registrationId: "AWS001",
    checkedInAt: "2026-09-15T10:04:23+05:30",
    attendanceReference: "ATT-AWS-0001",
    confirmationPdfUrl: null,
  });
});

test("returns the original record for duplicate attendance", async () => {
  const result = await submitFixtureAttendance("aws-cloud-workshop", "00125", {
    status: "granted",
    latitude: 12.8729,
    longitude: 80.2184,
    accuracy: 20,
  });

  assert.equal(result.status, "already-recorded");
  assert.equal(result.checkedInAt, "2026-09-15T09:58:41+05:30");
  assert.equal(result.attendanceReference, "ATT-AWS-0002");
});

test("returns location, lock, timing, and unavailable terminal outcomes", async () => {
  assert.deepEqual(
    await submitFixtureAttendance("aws-cloud-workshop", "AWS001", { status: "denied" }),
    { status: "location-rejected", locationStatus: "denied" },
  );
  assert.deepEqual(
    await submitFixtureAttendance("aws-cloud-workshop", "AWS001", {
      status: "granted", latitude: 13.0827, longitude: 80.2707, accuracy: 20,
    }),
    { status: "location-rejected", locationStatus: "outside" },
  );
  assert.deepEqual(
    await submitFixtureAttendance("aws-cloud-workshop", "LOCK001", null),
    { status: "locked", retryAfterSeconds: 60 },
  );
  assert.deepEqual(
    await submitFixtureAttendance("aws-cloud-workshop", "CLOSED001", null),
    { status: "closed" },
  );
  assert.deepEqual(
    await submitFixtureAttendance("aws-cloud-workshop", "WAIT001", null),
    { status: "not-open" },
  );
  await assert.rejects(
    submitFixtureAttendance("aws-cloud-workshop", "RETRY001", null),
    /Fixture service unavailable/,
  );
});
