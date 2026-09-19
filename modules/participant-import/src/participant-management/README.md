# participant-management

Reusable participant management logic for the Member 1 Participant Import &
Event Data Admin module.

This code is **integration-ready** — it operates on plain `Participant`
objects and has no database, API, or UI dependencies. Backend persistence
and admin UI wiring belong to the Technical Lead / root application.

---

## What this module does

Provides three focused operations on an in-memory `Participant[]` collection:

| Operation    | Function               | Description                                      |
|--------------|------------------------|--------------------------------------------------|
| Search       | `searchParticipants`   | Filter participants by registration ID or name   |
| Update       | `updateParticipant`    | Apply field changes, returns a new Participant   |
| Deactivate   | `deactivateParticipant`| Set status to `"disabled"`, returns a new object |

All functions are **pure** — they never mutate the inputs they receive.

---

## Exported functions

### `searchParticipants(participants, query)`

```ts
import { searchParticipants } from "./search-participants";

const results = searchParticipants(participants, "REG001");
const byName  = searchParticipants(participants, "aarav"); // case-insensitive
const all     = searchParticipants(participants, "");      // empty → all
```

| Parameter      | Type            | Notes                                      |
|----------------|-----------------|--------------------------------------------|
| `participants` | `Participant[]` | Source collection — not mutated            |
| `query`        | `string`        | Trimmed before use; empty returns all      |

**Matching rules**
- `registrationId` — exact string equality after trimming the query.
- `name` — case-insensitive substring match.

Returns a new `Participant[]`. The original array is never mutated.

---

### `updateParticipant(participant, fields)`

```ts
import { updateParticipant } from "./update-participant";

const result = updateParticipant(participant, { name: "New Name", year: 3 });

if (result.success) {
  const updated = result.participant; // new Participant object
} else {
  console.error(result.errors);      // UpdateError[]
}
```

**Updatable fields:** `name`, `email`, `phone`, `college`, `department`,
`section`, `year`, `customFields`.

**Locked fields (never changed):** `id`, `eventId`, `registrationId`.

**Validation**
- `name` cannot be empty or whitespace-only.
- `year`, when supplied, must be a positive whole number (`>= 1`, integer).

Returns `{ success: true, participant }` on success, or
`{ success: false, errors: UpdateError[] }` on failure.

---

### `deactivateParticipant(participant)`

```ts
import { deactivateParticipant } from "./deactivate-participant";

const disabled = deactivateParticipant(participant);
// disabled.status === "disabled"
// participant.status is unchanged
```

Sets `status` to `"disabled"`. Safe to call on an already-disabled
participant. Returns a new object; the original is never mutated.

---

## Expected Participant shape

Defined in `../types/participant.ts`:

```ts
interface Participant {
  id: string;
  eventId: string;
  registrationId: string;  // unique per event, string, never changed
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  section: string;
  year: number;
  customFields: Record<string, unknown>;
  status: string;          // "active" | "disabled"
}
```

---

## Integration notes

- **Backend persistence** — The Technical Lead's root application is
  responsible for loading `Participant[]` from the database and persisting
  the objects returned by `updateParticipant` / `deactivateParticipant`.
- **Admin UI** — Routes such as `/admin/events/:id/participants` belong to
  the root application. These functions are the data-layer primitives that
  the UI calls.
- **No side effects** — Nothing here touches a database, emits events, or
  calls an API. Safe to use in any context (server handler, service layer,
  test).
