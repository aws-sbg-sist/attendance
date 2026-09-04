import type { TokenGateState } from "../types";

export type RegistrationVerification =
  | { ok: true; participantName: string }
  | { ok: false };

export function validateFixtureToken(
  eventSlug: string,
  ticket: string | undefined,
): Promise<TokenGateState>;

export function verifyFixtureRegistration(
  eventSlug: string,
  registrationId: string,
): Promise<RegistrationVerification>;
