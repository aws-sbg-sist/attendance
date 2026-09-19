import type { ParticipantCsvRow } from "../types/csv";
import type { Participant } from "../types/participant";

export interface NormalizeParticipantOptions {
  id: string;
  eventId: string;
}

export function normalizeParticipant(
  row: ParticipantCsvRow,
  options: NormalizeParticipantOptions
): Participant {
  return {
    id: options.id,
    eventId: options.eventId,
    registrationId: row.registrationId.trim(),
    name: row.name.trim(),
    email: row.email.trim(),
    phone: row.phone.trim(),
    college: row.college.trim(),
    department: row.department.trim(),
    section: row.section.trim(),
    year: Number(row.year),
    customFields: {},
    status: "active",
  };
}