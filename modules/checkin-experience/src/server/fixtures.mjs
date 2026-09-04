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
  },
};

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
