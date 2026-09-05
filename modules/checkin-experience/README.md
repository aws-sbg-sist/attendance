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
