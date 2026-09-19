import { normalizeParticipant } from "../src/normalization/normalize-participant";
import type { ParticipantCsvRow } from "../src/types/csv";
import {
  assertEqual,
  assertDeepEqual,
} from "./test-utils";

const row: ParticipantCsvRow = {
  registrationId: " REG001 ",
  name: " Aarav Kumar ",
  email: " aarav@example.com ",
  phone: " 9876500001 ",
  college: " ABC Engineering College ",
  department: " CSE ",
  section: " A ",
  year: "2",
};

const participant = normalizeParticipant(row, {
  id: "participant-001",
  eventId: "evt-technova-2026",
});

assertEqual(
  participant.id,
  "participant-001",
  "should preserve the supplied participant ID"
);

assertEqual(
  participant.eventId,
  "evt-technova-2026",
  "should preserve the supplied event ID"
);

assertEqual(
  participant.registrationId,
  "REG001",
  "should trim registration ID"
);

assertEqual(
  participant.name,
  "Aarav Kumar",
  "should trim participant name"
);

assertEqual(
  participant.email,
  "aarav@example.com",
  "should trim email"
);

assertEqual(
  participant.phone,
  "9876500001",
  "should trim phone number"
);

assertEqual(
  participant.college,
  "ABC Engineering College",
  "should trim college"
);

assertEqual(
  participant.department,
  "CSE",
  "should trim department"
);

assertEqual(
  participant.section,
  "A",
  "should trim section"
);

assertEqual(
  participant.year,
  2,
  "should convert year from string to number"
);

assertEqual(
  typeof participant.year,
  "number",
  "year should be a number"
);

assertDeepEqual(
  participant.customFields,
  {},
  "should initialize custom fields as an empty object"
);

assertEqual(
  participant.status,
  "active",
  "should assign the current participant status"
);

console.log("Normalization tests passed.");