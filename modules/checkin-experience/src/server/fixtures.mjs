const fixtureTokens = {
  "live-aws-token": { eventSlug: "aws-cloud-workshop", state: "valid" },
  "expired-aws-token": { eventSlug: "aws-cloud-workshop", state: "expired" },
  "live-other-event": { eventSlug: "upcoming-event", state: "valid" },
};

const successfulRegistrations = {
  "aws-cloud-workshop": {
    AWS001: "Ananya Rao",
    "00125": "Karthik S",
    SLOW001: "Meera Krishnan",
    LOCK001: "Devika Nair",
    RETRY001: "Arjun Kumar",
    CLOSED001: "Riya Menon",
    WAIT001: "Aditya Shah",
  },
};

const recordedAttendance = {
  "aws-cloud-workshop": {
    AWS001: {
      checkedInAt: "2026-09-15T10:04:23+05:30",
      attendanceReference: "ATT-AWS-0001",
    },
    "00125": {
      checkedInAt: "2026-09-15T09:58:41+05:30",
      attendanceReference: "ATT-AWS-0002",
    },
    SLOW001: {
      checkedInAt: "2026-09-15T10:07:12+05:30",
      attendanceReference: "ATT-AWS-0003",
    },
  },
};

const fixtureVenueRules = {
  "aws-cloud-workshop": { latitude: 12.8729, longitude: 80.2184, radiusM: 250 },
};

function distanceInMeters(from, to) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const lat1 = radians(from.latitude);
  const lat2 = radians(to.latitude);
  const deltaLat = radians(to.latitude - from.latitude);
  const deltaLng = radians(to.longitude - from.longitude);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fixturesAllowed() {
  return process.env.NODE_ENV !== "production";
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function validateFixtureToken(eventSlug, ticket) {
  if (!fixturesAllowed()) return "invalid";
  if (!ticket) return "missing";

  const token = fixtureTokens[ticket];
  if (!token) return "invalid";
  if (token.eventSlug !== eventSlug) return "wrong-event";

  return token.state;
}

export async function verifyFixtureRegistration(eventSlug, registrationId) {
  if (!fixturesAllowed()) throw new Error("Fixture verification is disabled");

  await wait(registrationId === "SLOW001" ? 1800 : 500);

  if (registrationId === "ERROR001") {
    throw new Error("Fixture service unavailable");
  }

  const participantName = successfulRegistrations[eventSlug]?.[registrationId];
  if (!participantName) return { ok: false };

  return { ok: true, participantName };
}

export async function submitFixtureAttendance(eventSlug, registrationId, location) {
  if (!fixturesAllowed()) throw new Error("Fixture submission is disabled");

  const registration = await verifyFixtureRegistration(eventSlug, registrationId);
  if (!registration.ok) return { status: "invalid" };
  if (registrationId === "RETRY001") throw new Error("Fixture service unavailable");
  if (registrationId === "LOCK001") return { status: "locked", retryAfterSeconds: 60 };
  if (registrationId === "CLOSED001") return { status: "closed" };
  if (registrationId === "WAIT001") return { status: "not-open" };

  if (location?.status === "denied" || location?.status === "unavailable") {
    return { status: "location-rejected", locationStatus: location.status };
  }

  const venueRule = fixtureVenueRules[eventSlug];
  if (venueRule && !location) {
    return { status: "location-rejected", locationStatus: "unavailable" };
  }
  if (venueRule && location?.status === "granted") {
    const distanceM = distanceInMeters(location, venueRule);
    if (distanceM > venueRule.radiusM) {
      return { status: "location-rejected", locationStatus: "outside" };
    }
  }

  const attendance = recordedAttendance[eventSlug]?.[registrationId];
  if (!attendance) return { status: "invalid" };

  return {
    status: registrationId === "00125" ? "already-recorded" : "recorded",
    participantName: registration.participantName,
    registrationId,
    ...attendance,
    confirmationPdfUrl: null,
  };
}
