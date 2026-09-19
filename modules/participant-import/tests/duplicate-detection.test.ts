import { parseCsv } from "../src/parser/parse-csv";
import { detectCsvDuplicates } from "../src/duplicate-detection/detect-csv-duplicates";
import { detectExistingDuplicates } from "../src/duplicate-detection/detect-existing-duplicates";
import type { Participant } from "../src/types/participant";
import {
  assertEqual,
  assert,
  assertDeepEqual,
} from "./test-utils";

const csvText = `registrationId,name,email,phone,college,department,section,year
REG001,Aarav Kumar,aarav@example.com,9876500001,ABC Engineering College,CSE,A,2
REG002,Diya Sharma,diya@example.com,9876500002,XYZ Institute of Technology,ECE,B,2
REG001,Aarav Duplicate,duplicate@example.com,9876500099,ABC Engineering College,CSE,A,2
 REG003 ,Rohan Raj,rohan@example.com,9876500003,ABC Engineering College,IT,A,3`;

const rows = parseCsv(csvText);

const csvDuplicates = detectCsvDuplicates(rows);

assertEqual(
  csvDuplicates.length,
  1,
  "should detect one duplicated registration ID"
);

assertEqual(
  csvDuplicates[0]?.registrationId,
  "REG001",
  "should identify the duplicated registration ID"
);

assertDeepEqual(
  csvDuplicates[0]?.rows,
  [2, 4],
  "should report the correct CSV row numbers for the duplicate"
);

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

const existingDuplicates = detectExistingDuplicates(
  rows,
  existingParticipants
);

assertEqual(
  existingDuplicates.length,
  1,
  "should detect one existing participant duplicate"
);

assertEqual(
  existingDuplicates[0]?.registrationId,
  "REG003",
  "should identify the existing registration ID"
);

assertEqual(
  existingDuplicates[0]?.row,
  5,
  "should report the correct CSV row number"
);

assert(
  existingDuplicates[0]?.registrationId === "REG003",
  "should trim whitespace before checking existing registration IDs"
);

console.log("Duplicate detection tests passed.");