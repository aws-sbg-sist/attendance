export type CheckInLocation =
  | null
  | { status: "denied" | "unavailable" }
  | { status: "granted"; latitude: number; longitude: number; accuracy: number };

export function parseCheckInRequest(body: unknown): {
  registrationId: string;
  location: CheckInLocation;
} | null;
