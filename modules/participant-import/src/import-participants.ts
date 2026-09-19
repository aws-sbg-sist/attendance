
import { parseCsv } from "./parser/parse-csv";
import { validateParticipants } from "./validation/validate-participants";
import { detectCsvDuplicates } from "./duplicate-detection/detect-csv-duplicates";
import { detectExistingDuplicates } from "./duplicate-detection/detect-existing-duplicates";
import { normalizeParticipant } from "./normalization/normalize-participant";

import type { Participant } from "./types/participant";
import type { ParticipantCsvRow } from "./types/csv";
import type { ValidationError } from "./validation/validation-result";

export interface ImportDuplicate {
  registrationId: string;
  row: number;
  reason: "duplicate-in-file" | "already-registered";
}

export interface ImportResult {
  totalRows: number;
  validRows: ParticipantCsvRow[];
  participantsToCreate: Participant[];
  validationErrors: ValidationError[];
  duplicates: ImportDuplicate[];
}

export interface ImportParticipantsOptions {
  eventId: string;
  generateParticipantId: (row: ParticipantCsvRow) => string;
}

export function importParticipants(
  csvText: string,
  existingParticipants: Participant[] = [],
  options: ImportParticipantsOptions
): ImportResult {
  const parsedRows = parseCsv(csvText);

  const validationResult = validateParticipants(parsedRows);

  const csvDuplicates = detectCsvDuplicates(parsedRows);

  const existingDuplicates = detectExistingDuplicates(
    validationResult.validRows,
    existingParticipants
  );

  const validRowNumbers = new Set(
    validationResult.validRows.map((row) => parsedRows.indexOf(row) + 2)
  );

  const duplicateRegistrationIds = new Set(
    csvDuplicates.map((duplicate) => duplicate.registrationId)
  );

  const rowsToCreate: Participant[] = [];
  const duplicates: ImportDuplicate[] = [];

  const importedRegistrationIds = new Set<string>();

  parsedRows.forEach((row, index) => {
    const registrationId = row.registrationId.trim();
    const rowNumber = index + 2;

    if (!validRowNumbers.has(rowNumber)) {
      return;
    }

    const existingDuplicate = existingDuplicates.find(
      (duplicate) =>
        duplicate.registrationId === registrationId &&
        duplicate.row === rowNumber
    );

    if (existingDuplicate) {
      duplicates.push({
        registrationId,
        row: rowNumber,
        reason: "already-registered",
      });

      return;
    }

    if (duplicateRegistrationIds.has(registrationId)) {
      if (importedRegistrationIds.has(registrationId)) {
        duplicates.push({
          registrationId,
          row: rowNumber,
          reason: "duplicate-in-file",
        });

        return;
      }
    }

    const participant = normalizeParticipant(row, {
      id: options.generateParticipantId(row),
      eventId: options.eventId,
    });

    rowsToCreate.push(participant);
    importedRegistrationIds.add(registrationId);
  });

  return {
    totalRows: parsedRows.length,
    validRows: validationResult.validRows,
    participantsToCreate: rowsToCreate,
    validationErrors: validationResult.errors,
    duplicates,
  };
}