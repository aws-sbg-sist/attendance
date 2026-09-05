const receiptStatuses = new Set(["recorded", "already-recorded"]);
const simpleStatuses = new Set(["closed", "not-open", "unavailable", "invalid"]);
const locationStatuses = new Set(["denied", "unavailable", "outside"]);

function safeDownloadUrl(value) {
  return value === null || (
    typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
  );
}

export function parseAttendanceResult(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  if (receiptStatuses.has(value.status)) {
    if (
      typeof value.participantName !== "string" || !value.participantName ||
      typeof value.registrationId !== "string" || !value.registrationId ||
      typeof value.checkedInAt !== "string" || Number.isNaN(Date.parse(value.checkedInAt)) ||
      typeof value.attendanceReference !== "string" || !value.attendanceReference ||
      !safeDownloadUrl(value.confirmationPdfUrl)
    ) return null;

    return {
      status: value.status,
      participantName: value.participantName,
      registrationId: value.registrationId,
      checkedInAt: value.checkedInAt,
      attendanceReference: value.attendanceReference,
      confirmationPdfUrl: value.confirmationPdfUrl,
    };
  }

  if (value.status === "locked") {
    return Number.isInteger(value.retryAfterSeconds) && value.retryAfterSeconds > 0
      ? { status: "locked", retryAfterSeconds: value.retryAfterSeconds }
      : null;
  }

  if (value.status === "location-rejected") {
    return locationStatuses.has(value.locationStatus)
      ? { status: "location-rejected", locationStatus: value.locationStatus }
      : null;
  }

  return simpleStatuses.has(value.status) ? { status: value.status } : null;
}
