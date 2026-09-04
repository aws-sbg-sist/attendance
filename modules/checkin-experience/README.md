# Check-in Experience

Member 2 owns the participant-facing check-in frontend in this module.

Task 2 adds the public event landing view and its open, not-open, closed, loading, and unavailable states. It currently uses safe local fixture events while the shared public event API is unavailable.

## Preview routes

- `/event/aws-cloud-workshop` - attendance open
- `/event/upcoming-event` - attendance not open
- `/event/closed-event` - attendance closed
- `/event/unknown-event` - event unavailable

QR handling, final participant preview, attendance submission, and receipt integration are not implemented in this task.

## Task 3 fixture verification

The registration-ID form uses local fixture responses until the shared public check-in contract is available.

- `AWS001` - valid registration
- `00125` - valid registration with leading zeroes
- `SLOW001` - valid registration with a slow response
- `ERROR001` - temporary service failure
- Any other value, including disabled or wrong-event test IDs, returns the same generic verification failure

The fixture never claims that attendance has been recorded. QR handling, final participant preview, attendance submission, and receipt integration remain out of scope.

## Task 4 QR gate fixtures

The QR deep link sends the opaque `ticket` to `/event/:slug/check-in`. The server validates it, creates a short-lived signed HttpOnly gate cookie, and redirects to the clean event URL. The participant page never receives or displays the raw ticket.

- `/event/aws-cloud-workshop/check-in?ticket=live-aws-token` - current token for the open fixture event
- `/event/aws-cloud-workshop/check-in?ticket=expired-aws-token` - expired token
- `/event/aws-cloud-workshop/check-in?ticket=tampered-token` - unknown or tampered token
- `/event/aws-cloud-workshop/check-in?ticket=live-other-event` - token belonging to another event
- `/event/aws-cloud-workshop` without a signed gate cookie - venue QR required

Token generation, signing, rotation, nonce storage, replay protection, and anti-abuse controls remain owned by Member 3 and are not implemented here.

Fixture token and participant data live only in server-imported development modules. Production disables the fixture validation routes and requires `TOKEN_SECRET` for signed gate sessions. The real Member 3 and Technical Lead services must replace these adapters before deployment.
