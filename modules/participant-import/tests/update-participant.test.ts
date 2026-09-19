import { updateParticipant } from "../src/participant-management/update-participant";
import type { Participant } from "../src/types/participant";
import {
  assertEqual,
  assert,
  assertDeepEqual,
} from "./test-utils";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const original: Participant = {
  id: "p-001",
  eventId: "evt-001",
  registrationId: "REG001",
  name: "Aarav Kumar",
  email: "aarav@example.com",
  phone: "9876500001",
  college: "ABC Engineering College",
  department: "CSE",
  section: "A",
  year: 2,
  customFields: {},
  status: "active",
};

// ---------------------------------------------------------------------------
// Update a single normal field
// ---------------------------------------------------------------------------

const nameResult = updateParticipant(original, { name: "Aarav K." });

assert(nameResult.success, "updating name should succeed");
assertEqual(
  nameResult.participant?.name,
  "Aarav K.",
  "should update the name field"
);

const emailResult = updateParticipant(original, { email: "new@example.com" });

assert(emailResult.success, "updating email should succeed");
assertEqual(
  emailResult.participant?.email,
  "new@example.com",
  "should update the email field"
);

const phoneResult = updateParticipant(original, { phone: "9000000001" });

assert(phoneResult.success, "updating phone should succeed");
assertEqual(
  phoneResult.participant?.phone,
  "9000000001",
  "should update the phone field"
);

const collegeResult = updateParticipant(original, { college: "New College" });

assert(collegeResult.success, "updating college should succeed");
assertEqual(
  collegeResult.participant?.college,
  "New College",
  "should update the college field"
);

const deptResult = updateParticipant(original, { department: "IT" });

assert(deptResult.success, "updating department should succeed");
assertEqual(
  deptResult.participant?.department,
  "IT",
  "should update the department field"
);

const sectionResult = updateParticipant(original, { section: "C" });

assert(sectionResult.success, "updating section should succeed");
assertEqual(
  sectionResult.participant?.section,
  "C",
  "should update the section field"
);

const yearResult = updateParticipant(original, { year: 3 });

assert(yearResult.success, "updating year should succeed");
assertEqual(
  yearResult.participant?.year,
  3,
  "should update the year field"
);

// ---------------------------------------------------------------------------
// Update multiple fields at once
// ---------------------------------------------------------------------------

const multiResult = updateParticipant(original, {
  name: "Aarav K.",
  email: "aaravk@example.com",
  year: 4,
  section: "B",
});

assert(multiResult.success, "updating multiple fields should succeed");
assertEqual(multiResult.participant?.name, "Aarav K.", "multi-update: name");
assertEqual(
  multiResult.participant?.email,
  "aaravk@example.com",
  "multi-update: email"
);
assertEqual(multiResult.participant?.year, 4, "multi-update: year");
assertEqual(multiResult.participant?.section, "B", "multi-update: section");

// ---------------------------------------------------------------------------
// Update customFields
// ---------------------------------------------------------------------------

const customResult = updateParticipant(original, {
  customFields: { tshirtSize: "M", dietaryRestriction: "none" },
});

assert(customResult.success, "updating customFields should succeed");
assertEqual(
  customResult.participant?.customFields["tshirtSize"],
  "M",
  "should update customFields"
);

// ---------------------------------------------------------------------------
// Reject empty name
// ---------------------------------------------------------------------------

const emptyNameResult = updateParticipant(original, { name: "" });

assert(!emptyNameResult.success, "empty name should be rejected");
assert(
  Array.isArray(emptyNameResult.errors) && emptyNameResult.errors.length > 0,
  "should return errors when name is empty"
);
assertEqual(
  emptyNameResult.errors?.[0]?.field,
  "name",
  "error field should be 'name'"
);

const whitespaceNameResult = updateParticipant(original, { name: "   " });

assert(!whitespaceNameResult.success, "whitespace-only name should be rejected");

// ---------------------------------------------------------------------------
// Reject invalid year values
// ---------------------------------------------------------------------------

const zeroYearResult = updateParticipant(original, { year: 0 });

assert(!zeroYearResult.success, "year 0 should be rejected");
assertEqual(
  zeroYearResult.errors?.[0]?.field,
  "year",
  "error field should be 'year' for zero"
);

const negativeYearResult = updateParticipant(original, { year: -1 });

assert(!negativeYearResult.success, "negative year should be rejected");

const floatYearResult = updateParticipant(original, { year: 1.5 });

assert(!floatYearResult.success, "fractional year should be rejected");

// ---------------------------------------------------------------------------
// Identity fields are preserved after update
// ---------------------------------------------------------------------------

const updatedParticipant = updateParticipant(original, { name: "New Name" })
  .participant!;

assertEqual(
  updatedParticipant.id,
  original.id,
  "id must not change after update"
);

assertEqual(
  updatedParticipant.eventId,
  original.eventId,
  "eventId must not change after update"
);

assertEqual(
  updatedParticipant.registrationId,
  original.registrationId,
  "registrationId must not change after update"
);

// ---------------------------------------------------------------------------
// Original object is not mutated
// ---------------------------------------------------------------------------

updateParticipant(original, { name: "Someone Else", year: 99 });

assertEqual(
  original.name,
  "Aarav Kumar",
  "original participant name must not be mutated"
);

assertEqual(
  original.year,
  2,
  "original participant year must not be mutated"
);

// Result is a different object reference
const resultObj = updateParticipant(original, { section: "Z" }).participant!;

assert(
  resultObj !== original,
  "update should return a new object, not the original reference"
);

// ---------------------------------------------------------------------------
// Unchanged fields are preserved
// ---------------------------------------------------------------------------

const partialUpdate = updateParticipant(original, { email: "x@x.com" })
  .participant!;

assertEqual(
  partialUpdate.name,
  original.name,
  "unmodified fields should be preserved after partial update"
);

assertEqual(
  partialUpdate.college,
  original.college,
  "college should be preserved when not in update fields"
);

assertDeepEqual(
  partialUpdate.customFields,
  original.customFields,
  "customFields should be preserved when not in update fields"
);

console.log("Update participant tests passed.");
