import type { Participant } from "../types/participant";

/**
 * Returns a new Participant object with status set to "disabled".
 *
 * - Does not delete the participant.
 * - If the participant is already disabled, the result is unchanged.
 * - The original participant object is never mutated.
 * - Identity fields (id, eventId, registrationId) are preserved.
 */
export function deactivateParticipant(participant: Participant): Participant {
  return {
    ...participant,
    status: "disabled",
    // Ensure identity fields are never overwritten by a spread
    id: participant.id,
    eventId: participant.eventId,
    registrationId: participant.registrationId,
  };
}
