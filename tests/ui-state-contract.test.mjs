import assert from "node:assert/strict";
import test from "node:test";
import { parseAttendanceResult } from "../modules/checkin-experience/src/attendance-result.mjs";

const receipt = {
  participantName: "Ananya Rao",
  registrationId: "AWS001",
  checkedInAt: "2026-09-15T10:04:23+05:30",
  attendanceReference: "ATT-AWS-0001",
  confirmationPdfUrl: null,
};

const cases = [
  ["successful attendance", { status: "recorded", ...receipt }, "recorded"],
  ["duplicate attendance", { status: "already-recorded", ...receipt }, "already-recorded"],
  ["temporary lock", { status: "locked", retryAfterSeconds: 60 }, "locked"],
  ["location permission denied", { status: "location-rejected", locationStatus: "denied" }, "location-rejected"],
  ["location unavailable", { status: "location-rejected", locationStatus: "unavailable" }, "location-rejected"],
  ["outside venue", { status: "location-rejected", locationStatus: "outside" }, "location-rejected"],
  ["attendance closed", { status: "closed" }, "closed"],
  ["attendance not open", { status: "not-open" }, "not-open"],
  ["service unavailable", { status: "unavailable" }, "unavailable"],
  ["generic invalid response", { status: "invalid" }, "invalid"],
];

for (const [name, input, expectedStatus] of cases) {
  test(`accepts the ${name} UI state`, () => {
    assert.equal(parseAttendanceResult(input)?.status, expectedStatus);
  });
}

test("rejects a malformed server timestamp", () => {
  assert.equal(parseAttendanceResult({ status: "recorded", ...receipt, checkedInAt: "not-a-date" }), null);
});

test("rejects an unsafe confirmation URL", () => {
  assert.equal(parseAttendanceResult({
    status: "recorded",
    ...receipt,
    confirmationPdfUrl: "https://untrusted.example/receipt.pdf",
  }), null);
});
