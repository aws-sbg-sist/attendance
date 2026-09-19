import { deactivateParticipant } from "../src/participant-management/deactivate-participant";
import type { Participant } from "../src/types/participant";
import {
  assertEqual,
  assert,
} from "./test-utils";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const activeParticipant: Participant = {
  id: "p-001",
  eventId: "evt-001",
  registrationId: "REG001",
  name: "Aarav Kumar",
  email: "aarav@example.com",
  phone: "9876500001",
  college: "ABC Engineering College",
  department: "CSE",
  section: "A",
  year: 2,
  customFields: {},
  status: "active",
};

const disabledParticipant: Participant = {
  ...activeParticipant,
  id: "p-002",
  registrationId: "REG002",
  status: "disabled",
};

// ---------------------------------------------------------------------------
// Active participant becomes disabled
// ---------------------------------------------------------------------------

const deactivated = deactivateParticipant(activeParticipant);

assertEqual(
  deactivated.status,
  "disabled",
  "active participant should become disabled after deactivation"
);

// ---------------------------------------------------------------------------
// Identity fields remain unchanged
// ---------------------------------------------------------------------------

assertEqual(
  deactivated.id,
  activeParticipant.id,
  "id must not change after deactivation"
);

assertEqual(
  deactivated.eventId,
  activeParticipant.eventId,
  "eventId must not change after deactivation"
);

assertEqual(
  deactivated.registrationId,
  activeParticipant.registrationId,
  "registrationId must not change after deactivation"
);

// ---------------------------------------------------------------------------
// Non-identity fields are also preserved
// ---------------------------------------------------------------------------

assertEqual(
  deactivated.name,
  activeParticipant.name,
  "name must be preserved after deactivation"
);

assertEqual(
  deactivated.email,
  activeParticipant.email,
  "email must be preserved after deactivation"
);

assertEqual(
  deactivated.year,
  activeParticipant.year,
  "year must be preserved after deactivation"
);

// ---------------------------------------------------------------------------
// Original participant object is not mutated
// ---------------------------------------------------------------------------

assertEqual(
  activeParticipant.status,
  "active",
  "original participant status must not be mutated by deactivation"
);

assert(
  deactivated !== activeParticipant,
  "deactivate should return a new object, not the original reference"
);

// ---------------------------------------------------------------------------
// Already-disabled participant remains disabled
// ---------------------------------------------------------------------------

const stillDisabled = deactivateParticipant(disabledParticipant);

assertEqual(
  stillDisabled.status,
  "disabled",
  "already-disabled participant should remain disabled"
);

assertEqual(
  stillDisabled.id,
  disabledParticipant.id,
  "id must not change when deactivating an already-disabled participant"
);

assertEqual(
  stillDisabled.registrationId,
  disabledParticipant.registrationId,
  "registrationId must not change when deactivating an already-disabled participant"
);

// Original disabled participant is also not mutated
assertEqual(
  disabledParticipant.status,
  "disabled",
  "original disabled participant must not be mutated"
);

assert(
  stillDisabled !== disabledParticipant,
  "result should be a new object even when participant was already disabled"
);

console.log("Deactivate participant tests passed.");
