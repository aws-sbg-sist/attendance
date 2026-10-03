const locationStatuses = new Set(["denied", "unavailable"]);

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function parseCheckInRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;

  const registrationId = typeof body.registrationId === "string" ? body.registrationId.trim() : "";
  if (!registrationId || registrationId.length > 128) return null;

  if (body.location === null) return { registrationId, location: null };
  if (!body.location || typeof body.location !== "object" || Array.isArray(body.location)) return null;

  if (locationStatuses.has(body.location.status)) {
    return { registrationId, location: { status: body.location.status } };
  }

  if (
    body.location.status !== "granted" ||
    !isFiniteNumber(body.location.latitude) || body.location.latitude < -90 || body.location.latitude > 90 ||
    !isFiniteNumber(body.location.longitude) || body.location.longitude < -180 || body.location.longitude > 180 ||
    !isFiniteNumber(body.location.accuracy) || body.location.accuracy < 0
  ) return null;

  return {
    registrationId,
    location: {
      status: "granted",
      latitude: body.location.latitude,
      longitude: body.location.longitude,
      accuracy: body.location.accuracy,
    },
  };
}
