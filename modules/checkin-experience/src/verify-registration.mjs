const successfulRegistrations = {
  "aws-cloud-workshop": {
    AWS001: "Ananya Rao",
    "00125": "Karthik S",
    SLOW001: "Meera Krishnan",
  },
};

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function verifyFixtureRegistration(eventSlug, registrationId) {
  await wait(registrationId === "SLOW001" ? 1800 : 500);

  if (registrationId === "ERROR001") {
    throw new Error("Fixture service unavailable");
  }

  const participantName = successfulRegistrations[eventSlug]?.[registrationId];
  if (!participantName) return { ok: false };

  return { ok: true, participantName };
}
