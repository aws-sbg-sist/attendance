# Check-in Experience

Member 2 owns the participant-facing check-in frontend in this module.

Task 2 adds the public event landing view and its open, not-open, closed, loading, and unavailable states. It currently uses safe local fixture events while the shared public event API is unavailable.

## Preview routes

- `/event/aws-cloud-workshop` - attendance open
- `/event/upcoming-event` - attendance not open
- `/event/closed-event` - attendance closed
- `/event/unknown-event` - event unavailable

## Task 3 fixture verification

The registration-ID form uses local fixture responses until the shared public check-in contract is available.

- `AWS001` - valid registration
- `00125` - valid registration with leading zeroes
- `SLOW001` - valid registration with a slow response
- `ERROR001` - temporary service failure
- Any other value, including disabled or wrong-event test IDs, returns the same generic verification failure

## Task 4 QR gate fixtures

The QR deep link sends the opaque `ticket` to `/event/:slug/check-in`. The server validates it, creates a short-lived signed HttpOnly gate cookie, and redirects to the clean event URL. The participant page never receives or displays the raw ticket.

- `/event/aws-cloud-workshop/check-in?ticket=live-aws-token` - current token for the open fixture event
- `/event/aws-cloud-workshop/check-in?ticket=expired-aws-token` - expired token
- `/event/aws-cloud-workshop/check-in?ticket=tampered-token` - unknown or tampered token
- `/event/aws-cloud-workshop/check-in?ticket=live-other-event` - token belonging to another event
- `/event/aws-cloud-workshop` without a signed gate cookie - venue QR required

Token generation, signing, rotation, nonce storage, replay protection, and anti-abuse controls remain owned by Member 3 and are not implemented here.

Fixture token and participant data live only in server-imported development modules. Production disables the fixture validation routes and requires `TOKEN_SECRET` for signed gate sessions. The real Member 3 and Technical Lead services must replace these adapters before deployment.

## Task 5 and 6 attendance-result fixtures

After verification, the participant reviews their identity and event details before selecting **Mark My Attendance**. Location is requested only at that final step when enabled. The client waits for one of these server-owned development outcomes:

- `AWS001` - successful attendance with timestamp and reference
- `00125` - attendance already recorded, returning the original timestamp and reference
- `LOCK001` - temporary lock with a retry period
- `RETRY001` - service unavailable
- `CLOSED001` - attendance closed response
- `WAIT001` - attendance not open response
- Denied or unavailable browser location - configured location-policy rejection with a retry path

The success screen exposes the PDF download interface only when the shared backend supplies `confirmationPdfUrl`. The development adapter returns `null`, because confirmation PDF creation belongs to Member 4. The adapter demonstrates response compatibility but does not persist attendance; the Technical Lead's backend remains authoritative.

## Component and integration map

- `event-landing.tsx` - server-rendered public event identity and attendance-window states
- `registration-form.tsx` - client-side ID entry, verification preview, location request and terminal result UI
- `attendance-result.mjs` - validates the server response before the UI displays attendance success
- `fixture-events.ts` - development event records shaped like the shared `Event` contract
- `server/fixtures.mjs` - server-only development adapter for registration and attendance outcomes

Expected integration endpoints:

- `GET /public/events/:slug` supplies the public event contract.
- `POST /public/events/:slug/token/validate` supplies the Member 3 token-gate result.
- `POST /public/events/:slug/check-in` returns `recorded`, `already-recorded`, `locked`, `location-rejected`, `closed`, `not-open`, `invalid`, or `unavailable`.
- A recorded response includes the verified participant name and registration ID, server-generated `checkedInAt`, attendance reference, and an optional same-origin `confirmationPdfUrl` from Member 4.

The current `/api/dev/...` routes are local adapters only and are disabled in production. Replace them with the shared endpoints during integration. The participant page never downloads the full participant list, never decides attendance success, and never stores attendance on local disk.

## Accessibility and performance

All controls use semantic form elements, visible focus styles and minimum touch heights. Errors are associated with the registration field, and focus moves to verification and terminal-result panels after asynchronous transitions. The layout includes narrow-phone, phone, tablet and desktop breakpoints and respects reduced-motion settings in the loading view. No video, animation framework, dashboard bundle, participant dataset or PDF generator is loaded by the participant route.

## Visual system

The participant surface uses a dark technical product direction inspired by the restraint and density of premium developer tools, without copying their branding or layouts. Semantic tokens live in `apps/web/app/globals.css`; the event and form modules consume graphite surfaces, hairline borders, compact radii, system sans-serif type, monospace metadata, and AWS orange only for the primary action. Mobile keeps the check-in workspace before the compact event poster, and motion is limited to short control feedback with a reduced-motion fallback.
