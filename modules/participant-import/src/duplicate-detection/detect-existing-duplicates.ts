import type { ParticipantCsvRow } from "../types/csv";
import type { Participant } from "../types/participant";
import type { ExistingParticipantDuplicate } from "./duplicate-result";

export function detectExistingDuplicates(
  rows: ParticipantCsvRow[],
  existingParticipants: Participant[]
): ExistingParticipantDuplicate[] {
  const existingRegistrationIds = new Set(
    existingParticipants.map((participant) =>
      participant.registrationId.trim()
    )
  );

  const duplicates: ExistingParticipantDuplicate[] = [];

  rows.forEach((row, index) => {
    const registrationId = row.registrationId.trim();

    if (!registrationId) {
      return;
    }

    if (existingRegistrationIds.has(registrationId)) {
      duplicates.push({
        registrationId,
        row: index + 2,
      });
    }
  });

  return duplicates;
}