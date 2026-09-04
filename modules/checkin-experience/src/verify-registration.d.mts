export type RegistrationVerification =
  | { ok: true; participantName: string }
  | { ok: false };

export function verifyFixtureRegistration(
  eventSlug: string,
  registrationId: string,
): Promise<RegistrationVerification>;
