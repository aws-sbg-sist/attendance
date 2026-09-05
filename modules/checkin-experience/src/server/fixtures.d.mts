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

export type FixtureAttendanceResult =
  | { status: "invalid" }
  | { status: "locked"; retryAfterSeconds: number }
  | { status: "location-rejected"; locationStatus: "denied" | "unavailable" | "outside" }
  | { status: "closed" | "not-open" }
  | {
      status: "recorded" | "already-recorded";
      participantName: string;
      registrationId: string;
      checkedInAt: string;
      attendanceReference: string;
      confirmationPdfUrl: string | null;
    };

export function submitFixtureAttendance(
  eventSlug: string,
  registrationId: string,
  location: unknown,
): Promise<FixtureAttendanceResult>;
