import { importParticipants } from "../src/import-participants";
import type { Participant } from "../src/types/participant";
import {
  assertEqual,
  assert,
} from "./test-utils";

const csvText = `registrationId,name,email,phone,college,department,section,year
REG001,Aarav Kumar,aarav@example.com,9876500001,ABC Engineering College,CSE,A,2
REG002,Diya Sharma,diya@example.com,9876500002,XYZ Institute of Technology,ECE,B,2
REG001,Aarav Kumar Duplicate,duplicate@example.com,9876500099,ABC Engineering College,CSE,A,2
REG003,Rohan Raj,rohan@example.com,9876500003,ABC Engineering College,IT,A,3
REG004,Invalid Email,not-an-email,9876500004,DEF University,CSE,A,2`;

const existingParticipants: Participant[] = [
  {
    id: "participant-existing-001",
    eventId: "evt-technova-2026",
    registrationId: "REG003",
    name: "Existing Rohan",
    email: "rohan@existing.com",
    phone: "9876500003",
    college: "ABC Engineering College",
    department: "IT",
    section: "A",
    year: 3,
    customFields: {},
    status: "active",
  },
];

const result = importParticipants(
  csvText,
  existingParticipants,
  {
    eventId: "evt-technova-2026",
    generateParticipantId: (row) =>
      `participant-${row.registrationId}`,
  }
);

assertEqual(
  result.totalRows,
  5,
  "should count all CSV data rows"
);

assertEqual(
  result.validRows.length,
  4,
  "should keep all structurally valid rows"
);

assertEqual(
  result.validationErrors.length,
  1,
  "should report one validation error"
);

assertEqual(
  result.validationErrors[0]?.row,
  6,
  "should report the invalid email on the correct CSV row"
);

assertEqual(
  result.duplicates.length,
  2,
  "should report both duplicate rows"
);

assert(
  result.duplicates.some(
    (duplicate) =>
      duplicate.registrationId === "REG001" &&
      duplicate.row === 4 &&
      duplicate.reason === "duplicate-in-file"
  ),
  "should detect the duplicate registration ID inside the CSV"
);

assert(
  result.duplicates.some(
    (duplicate) =>
      duplicate.registrationId === "REG003" &&
      duplicate.row === 5 &&
      duplicate.reason === "already-registered"
  ),
  "should detect a participant already registered for the event"
);

assertEqual(
  result.participantsToCreate.length,
  2,
  "should create only the eligible participants"
);

assertEqual(
  result.participantsToCreate[0]?.registrationId,
  "REG001",
  "should create the first valid participant"
);

assertEqual(
  result.participantsToCreate[1]?.registrationId,
  "REG002",
  "should create the second valid participant"
);

assertEqual(
  result.participantsToCreate[0]?.id,
  "participant-REG001",
  "should use the generated participant ID"
);

assertEqual(
  result.participantsToCreate[0]?.eventId,
  "evt-technova-2026",
  "should assign the supplied event ID"
);

assertEqual(
  result.participantsToCreate[0]?.year,
  2,
  "should normalize participant year to a number"
);

console.log("Import participants tests passed.");