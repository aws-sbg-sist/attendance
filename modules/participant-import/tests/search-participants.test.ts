import { searchParticipants } from "../src/participant-management/search-participants";
import type { Participant } from "../src/types/participant";
import {
  assertEqual,
  assert,
} from "./test-utils";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const participants: Participant[] = [
  {
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
  },
  {
    id: "p-002",
    eventId: "evt-001",
    registrationId: "REG002",
    name: "Diya Sharma",
    email: "diya@example.com",
    phone: "9876500002",
    college: "XYZ Institute of Technology",
    department: "ECE",
    section: "B",
    year: 2,
    customFields: {},
    status: "active",
  },
  {
    id: "p-003",
    eventId: "evt-001",
    registrationId: "REG003",
    name: "Rohan Kumar",
    email: "rohan@example.com",
    phone: "9876500003",
    college: "ABC Engineering College",
    department: "IT",
    section: "A",
    year: 3,
    customFields: {},
    status: "disabled",
  },
];

// ---------------------------------------------------------------------------
// Empty query
// ---------------------------------------------------------------------------

const allResults = searchParticipants(participants, "");

assertEqual(
  allResults.length,
  3,
  "empty query should return all participants"
);

const whitespaceResults = searchParticipants(participants, "   ");

assertEqual(
  whitespaceResults.length,
  3,
  "whitespace-only query should return all participants"
);

// ---------------------------------------------------------------------------
// Search by registrationId
// ---------------------------------------------------------------------------

const byRegId = searchParticipants(participants, "REG001");

assertEqual(
  byRegId.length,
  1,
  "should find exactly one participant by registrationId"
);

assertEqual(
  byRegId[0]?.registrationId,
  "REG001",
  "should return the correct participant when searching by registrationId"
);

// ---------------------------------------------------------------------------
// Search by name (exact case)
// ---------------------------------------------------------------------------

const byName = searchParticipants(participants, "Diya Sharma");

assertEqual(
  byName.length,
  1,
  "should find participant by exact name"
);

assertEqual(
  byName[0]?.registrationId,
  "REG002",
  "should return the correct participant when searching by name"
);

// ---------------------------------------------------------------------------
// Case-insensitive name search
// ---------------------------------------------------------------------------

const byNameLower = searchParticipants(participants, "aarav kumar");

assertEqual(
  byNameLower.length,
  1,
  "should find participant with lowercase query"
);

assertEqual(
  byNameLower[0]?.registrationId,
  "REG001",
  "should return the correct participant for case-insensitive name search"
);

const byNameUpper = searchParticipants(participants, "DIYA SHARMA");

assertEqual(
  byNameUpper.length,
  1,
  "should find participant with uppercase query"
);

assertEqual(
  byNameUpper[0]?.registrationId,
  "REG002",
  "should return the correct participant for uppercase name search"
);

// ---------------------------------------------------------------------------
// Partial name match
// ---------------------------------------------------------------------------

const byPartialName = searchParticipants(participants, "kumar");

assertEqual(
  byPartialName.length,
  2,
  "should return all participants whose name contains the search term"
);

// ---------------------------------------------------------------------------
// No match
// ---------------------------------------------------------------------------

const noMatch = searchParticipants(participants, "REGXXX");

assertEqual(
  noMatch.length,
  0,
  "non-matching registrationId should return empty array"
);

const noNameMatch = searchParticipants(participants, "Priya");

assertEqual(
  noNameMatch.length,
  0,
  "non-matching name should return empty array"
);

// ---------------------------------------------------------------------------
// Original array is not mutated
// ---------------------------------------------------------------------------

const originalLength = participants.length;
searchParticipants(participants, "Aarav");

assertEqual(
  participants.length,
  originalLength,
  "original participant array should not be mutated by search"
);

// Empty-query result should be a copy, not the same reference
const copy = searchParticipants(participants, "");

assert(
  copy !== participants,
  "empty-query result should be a new array, not the original reference"
);

// ---------------------------------------------------------------------------
// registrationId matching is exact (not substring)
// ---------------------------------------------------------------------------

const partialRegId = searchParticipants(participants, "REG00");

assertEqual(
  partialRegId.length,
  0,
  "partial registrationId should not match — registrationId matching is exact"
);

console.log("Search participants tests passed.");
