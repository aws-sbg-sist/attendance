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
