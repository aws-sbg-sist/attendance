import type { ParticipantCsvRow } from "../types/csv";

const REQUIRED_HEADERS = [
  "registrationId",
  "name",
  "email",
  "phone",
  "college",
  "department",
  "section",
  "year",
] as const;

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

export function parseCsv(csvText: string): ParticipantCsvRow[] {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must contain a header and at least one data row.");
  }

  const headers = splitCsvLine(lines[0]);

  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      `Missing required CSV headers: ${missingHeaders.join(", ")}`
    );
  }

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);

    const row = Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""])
    );

    return {
      registrationId: row.registrationId,
      name: row.name,
      email: row.email,
      phone: row.phone,
      college: row.college,
      department: row.department,
      section: row.section,
      year: row.year,
    };
  });
}