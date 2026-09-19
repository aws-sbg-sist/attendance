import type { Participant } from "../types/participant";

/**
 * Fields that the caller may supply when updating a participant.
 * The identity fields (id, eventId, registrationId) are intentionally excluded.
 */
export interface ParticipantUpdateFields {
  name?: string;
  email?: string;
  phone?: string;
  college?: string;
  department?: string;
  section?: string;
  year?: number;
  customFields?: Record<string, unknown>;
}

export interface UpdateError {
  field: string;
  message: string;
}

export interface UpdateResult {
  success: boolean;
  participant?: Participant;
  errors?: UpdateError[];
}

/**
 * Returns a new Participant object with the supplied fields applied.
 *
 * Rules:
 * - id, eventId, registrationId are never changed.
 * - name cannot become an empty string.
 * - year, when supplied, must be a positive whole number.
 * - The original participant object is never mutated.
 */
export function updateParticipant(
  participant: Participant,
  fields: ParticipantUpdateFields
): UpdateResult {
  const errors: UpdateError[] = [];

  if (fields.name !== undefined) {
    if (fields.name.trim() === "") {
      errors.push({ field: "name", message: "name cannot be empty" });
    }
  }

  if (fields.year !== undefined) {
    if (!Number.isInteger(fields.year) || fields.year < 1) {
      errors.push({
        field: "year",
        message: "year must be a positive whole number",
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const updated: Participant = {
    ...participant,
    ...(fields.name !== undefined ? { name: fields.name.trim() } : {}),
    ...(fields.email !== undefined ? { email: fields.email } : {}),
    ...(fields.phone !== undefined ? { phone: fields.phone } : {}),
    ...(fields.college !== undefined ? { college: fields.college } : {}),
    ...(fields.department !== undefined ? { department: fields.department } : {}),
    ...(fields.section !== undefined ? { section: fields.section } : {}),
    ...(fields.year !== undefined ? { year: fields.year } : {}),
    ...(fields.customFields !== undefined
      ? { customFields: { ...fields.customFields } }
      : {}),
    // Identity fields are always restored to original values
    id: participant.id,
    eventId: participant.eventId,
    registrationId: participant.registrationId,
  };

  return { success: true, participant: updated };
}
