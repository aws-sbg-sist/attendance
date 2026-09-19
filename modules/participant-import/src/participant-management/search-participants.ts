import type { Participant } from "../types/participant";

/**
 * Searches a Participant[] by registrationId or name.
 *
 * - Matching is case-insensitive for names.
 * - Registration IDs are matched as-is (string equality after trim).
 * - An empty or whitespace-only query returns all participants.
 * - The original array is never mutated.
 */
export function searchParticipants(
  participants: Participant[],
  query: string
): Participant[] {
  const trimmed = query.trim();

  if (trimmed === "") {
    return participants.slice();
  }

  const lower = trimmed.toLowerCase();

  return participants.filter(
    (participant) =>
      participant.registrationId === trimmed ||
      participant.name.toLowerCase().includes(lower)
  );
}
