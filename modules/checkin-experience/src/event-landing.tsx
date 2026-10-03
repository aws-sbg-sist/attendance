import type { PublicEvent } from "./types";
import type { TokenGateState } from "./types";
import { RegistrationForm } from "./registration-form";
import styles from "./event-landing.module.css";

type EventLandingProps = {
  event: PublicEvent | null;
  tokenGate: TokenGateState;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "full",
  timeZone: "Asia/Kolkata",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

function StateMessage({ event }: { event: PublicEvent }) {
  if (event.status === "not-open") {
    return (
      <div className={`${styles.notice} ${styles.noticeWaiting}`} role="status">
        <strong>Attendance is not open yet.</strong>
        <span>Check-in opens at {formatTime(event.attendanceOpensAt)}.</span>
      </div>
    );
  }

  if (event.status === "closed") {
    return (
      <div className={`${styles.notice} ${styles.noticeClosed}`} role="status">
        <strong>Attendance for this event is closed.</strong>
        <span>The attendance window closed at {formatTime(event.attendanceClosesAt)}.</span>
      </div>
    );
  }

  return (
    <div className={`${styles.notice} ${styles.noticeOpen}`} role="status">
      <span className={styles.liveDot} aria-hidden="true" />
      <strong>Attendance is open</strong>
    </div>
  );
}

function TokenGateMessage({ state }: { state: Exclude<TokenGateState, "valid"> }) {
  if (state === "missing") {
    return (
      <section className={styles.qrGate} aria-labelledby="qr-gate-title">
        <p className={styles.qrLabel}>Venue code required</p>
        <h2 id="qr-gate-title">Scan the event code</h2>
        <p>Scan the currently displayed QR code at the venue to continue check-in.</p>
      </section>
    );
  }

  if (state === "expired") {
    return (
      <section className={`${styles.qrGate} ${styles.qrGateError}`} aria-labelledby="qr-expired-title">
        <p className={styles.qrLabel}>Event code expired</p>
        <h2 id="qr-expired-title">Scan the current venue code</h2>
        <p>This event code has expired. Scan the code currently displayed at the venue.</p>
      </section>
    );
  }

  return (
    <section className={`${styles.qrGate} ${styles.qrGateError}`} aria-labelledby="qr-invalid-title">
      <p className={styles.qrLabel}>Event code not verified</p>
      <h2 id="qr-invalid-title">Scan the current venue code</h2>
      <p>This event code could not be verified. Scan the code currently displayed at the venue.</p>
    </section>
  );
}

export function EventLanding({ event, tokenGate }: EventLandingProps) {
  if (!event) {
    return (
      <main className={styles.page}>
        <section className={styles.unavailable} aria-labelledby="event-unavailable-title">
          <div className={styles.brandMark} aria-hidden="true">AWS</div>
          <p className={styles.eyebrow}>AWS Student Builder Group</p>
          <h1 id="event-unavailable-title">Event unavailable</h1>
          <p>This event link could not be verified. Check the URL or contact the event team.</p>
          <a className={styles.secondaryAction} href="/">Return to attendance platform</a>
        </section>
      </main>
    );
  }

  const canCheckIn = event.status === "open";

  return (
    <main className={styles.page}>
      <article className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brandMark} aria-hidden="true">AWS</div>
          <div>
            <p className={styles.eyebrow}>AWS Student Builder Group</p>
            <p className={styles.institute}>Sathyabama Institute of Science and Technology</p>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.poster} role="img" aria-label={`Poster placeholder for ${event.name}`}>
            <span>AWS SBG</span>
            <strong>{event.name}</strong>
          </div>

          <section className={styles.details} aria-labelledby="event-title">
            <StateMessage event={event} />
            <p className={styles.eventLabel}>Event attendance</p>
            <h1 id="event-title">{event.name}</h1>

            <dl className={styles.facts}>
              <div>
                <dt>Date</dt>
                <dd>{formatDate(event.date)}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{formatTime(event.startsAt)}</dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>{event.venue}</dd>
              </div>
            </dl>

            {!canCheckIn ? (
              <button className={styles.primaryAction} type="button" disabled>
                Check-in unavailable
              </button>
            ) : tokenGate !== "valid" ? (
              <TokenGateMessage state={tokenGate} />
            ) : (
              <RegistrationForm
                event={{
                  slug: event.slug,
                  name: event.name,
                  venue: event.venue,
                  date: formatDate(event.date),
                  time: formatTime(event.startsAt),
                  locationEnabled:
                    event.venueLat !== null &&
                    event.venueLng !== null &&
                    event.venueRadiusM !== null,
                }}
              />
            )}
          </section>
        </div>
      </article>
    </main>
  );
}
