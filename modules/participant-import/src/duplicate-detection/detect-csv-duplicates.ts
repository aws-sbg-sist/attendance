import type { ParticipantCsvRow } from "../types/csv";
import type { DuplicateEntry } from "./duplicate-result";

export function detectCsvDuplicates(
  rows: ParticipantCsvRow[]
): DuplicateEntry[] {
  const registrationRows = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const registrationId = row.registrationId.trim();

    if (!registrationId) {
      return;
    }

    const csvRowNumber = index + 2;

    const existingRows = registrationRows.get(registrationId) ?? [];

    existingRows.push(csvRowNumber);

    registrationRows.set(registrationId, existingRows);
  });

  return Array.from(registrationRows.entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([registrationId, rows]) => ({
      registrationId,
      rows,
    }));
}