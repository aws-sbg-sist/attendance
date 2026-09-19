import { parseCsv } from "../src/parser/parse-csv";
import {
  assertEqual,
  assert,
} from "./test-utils";

const basicCsv = `registrationId,name,email,phone,college,department,section,year
REG001,Aarav Kumar,aarav@example.com,9876500001,ABC Engineering College,CSE,A,2
REG002,Diya Sharma,diya@example.com,9876500002,XYZ Institute of Technology,ECE,B,2`;

const basicRows = parseCsv(basicCsv);

assertEqual(
  basicRows.length,
  2,
  "should parse all data rows"
);

assertEqual(
  basicRows[0]?.registrationId,
  "REG001",
  "should parse registration ID"
);

assertEqual(
  basicRows[0]?.name,
  "Aarav Kumar",
  "should parse participant name"
);

assertEqual(
  basicRows[0]?.year,
  "2",
  "should keep CSV year as a string"
);

const quotedCsv = `registrationId,name,email,phone,college,department,section,year
REG003,"Rohan, Raj",rohan@example.com,9876500003,"ABC, Engineering College",IT,A,3`;

const quotedRows = parseCsv(quotedCsv);

assertEqual(
  quotedRows[0]?.name,
  "Rohan, Raj",
  "should preserve commas inside quoted values"
);

assertEqual(
  quotedRows[0]?.college,
  "ABC, Engineering College",
  "should preserve quoted commas"
);

const escapedQuoteCsv = `registrationId,name,email,phone,college,department,section,year
REG004,"Ananya ""Anu"" Krish",ananya@example.com,9876500004,DEF University,CSE,C,1`;

const escapedQuoteRows = parseCsv(escapedQuoteCsv);

assertEqual(
  escapedQuoteRows[0]?.name,
  'Ananya "Anu" Krish',
  "should parse escaped quotes"
);

const bomCsv = `\uFEFFregistrationId,name,email,phone,college,department,section,year
REG005,Meera Nair,meera@example.com,9876500005,DEF University,EEE,B,2`;

const bomRows = parseCsv(bomCsv);

assertEqual(
  bomRows[0]?.registrationId,
  "REG005",
  "should remove UTF-8 BOM from headers"
);

let missingHeaderError = false;

try {
  parseCsv(
    `registrationId,name,email
REG006,Invalid User,invalid@example.com`
  );
} catch {
  missingHeaderError = true;
}

assert(
  missingHeaderError,
  "should reject CSV with missing required headers"
);

let emptyDataError = false;

try {
  parseCsv(
    "registrationId,name,email,phone,college,department,section,year"
  );
} catch {
  emptyDataError = true;
}

assert(
  emptyDataError,
  "should reject CSV without data rows"
);

console.log("Parser tests passed.");