import { parseCsv } from "../src/parser/parse-csv";
import { validateParticipants } from "../src/validation/validate-participants";
import {
  assertEqual,
  assert,
} from "./test-utils";

const csvText = `registrationId,name,email,phone,college,department,section,year
REG001,Aarav Kumar,aarav@example.com,9876500001,ABC Engineering College,CSE,A,2
,Missing Registration ID,missing@example.com,9876500002,ABC Engineering College,ECE,A,2
REG003,,noname@example.com,9876500003,XYZ Institute of Technology,CSE,B,3
REG004,Invalid Email,not-an-email,9876500004,DEF University,IT,A,2
REG005,Invalid Phone,phone@example.com,abc,DEF University,ECE,B,2
REG006,Invalid Year,year@example.com,9876500006,ABC Engineering College,CSE,A,abc
REG007,Multiple Errors,invalid-email,abc,DEF University,,,abc`;

const rows = parseCsv(csvText);
const result = validateParticipants(rows);

assertEqual(
  result.validRows.length,
  1,
  "should accept only the valid participant row"
);

assertEqual(
  result.validRows[0]?.registrationId,
  "REG001",
  "should preserve the valid registration ID"
);

assertEqual(
  result.errors.length,
  10,
  "should report all validation errors"
);

assert(
  result.errors.some(
    (error) =>
      error.row === 3 &&
      error.field === "registrationId"
  ),
  "should detect missing registration ID"
);

assert(
  result.errors.some(
    (error) =>
      error.row === 4 &&
      error.field === "name"
  ),
  "should detect missing name"
);

assert(
  result.errors.some(
    (error) =>
      error.row === 5 &&
      error.field === "email"
  ),
  "should detect invalid email"
);

assert(
  result.errors.some(
    (error) =>
      error.row === 6 &&
      error.field === "phone"
  ),
  "should detect invalid phone"
);

assert(
  result.errors.some(
    (error) =>
      error.row === 7 &&
      error.field === "year"
  ),
  "should detect invalid year"
);

const multipleErrorRow = result.errors.filter(
  (error) => error.row === 8
);

assertEqual(
  multipleErrorRow.length,
  5,
  "should report all errors from the same row"
);

console.log("Validation tests passed.");