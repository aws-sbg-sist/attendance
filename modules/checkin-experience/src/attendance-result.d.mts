export type AttendanceReceipt = {
  status: "recorded" | "already-recorded";
  participantName: string;
  registrationId: string;
  checkedInAt: string;
  attendanceReference: string;
  confirmationPdfUrl: string | null;
};

export type AttendanceFailure =
  | { status: "locked"; retryAfterSeconds: number }
  | { status: "location-rejected"; locationStatus: "denied" | "unavailable" | "outside" }
  | { status: "closed" | "not-open" | "unavailable" | "invalid" };

export type AttendanceResult = AttendanceReceipt | AttendanceFailure;

export function parseAttendanceResult(value: unknown): AttendanceResult | null;
