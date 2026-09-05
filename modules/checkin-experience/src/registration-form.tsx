"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { parseAttendanceResult } from "./attendance-result.mjs";
import type { AttendanceReceipt, AttendanceResult } from "./attendance-result.mjs";
import styles from "./registration-form.module.css";

type RegistrationFormProps = {
  event: {
    slug: string;
    name: string;
    venue: string;
    date: string;
    time: string;
    locationEnabled: boolean;
  };
};

type LocationResult =
  | { status: "granted"; latitude: number; longitude: number; accuracy: number }
  | { status: "denied" | "unavailable" };

type FormState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "error"; message: string }
  | { kind: "verified"; participantName: string; registrationId: string }
  | { kind: "locating"; participantName: string; registrationId: string }
  | { kind: "submitting"; participantName: string; registrationId: string }
  | { kind: "result"; participantName: string; registrationId: string; result: AttendanceResult };

const attendanceTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Asia/Kolkata",
});

function isAttendanceReceipt(result: AttendanceResult): result is AttendanceReceipt {
  return result.status === "recorded" || result.status === "already-recorded";
}

function requestLocation(): Promise<LocationResult> {
  if (!("geolocation" in navigator)) return Promise.resolve({ status: "unavailable" });

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        status: "granted",
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      }),
      (error) => resolve({ status: error.code === error.PERMISSION_DENIED ? "denied" : "unavailable" }),
      { enableHighAccuracy: false, maximumAge: 0, timeout: 8000 },
    );
  });
}

export function RegistrationForm({ event }: RegistrationFormProps) {
  const inputId = useId();
  const helpId = useId();
  const messageId = useId();
  const submissionLocked = useRef(false);
  const statePanel = useRef<HTMLElement>(null);
  const [registrationId, setRegistrationId] = useState("");
  const [state, setState] = useState<FormState>({ kind: "idle" });

  useEffect(() => {
    if (state.kind === "verified" || state.kind === "result") statePanel.current?.focus();
  }, [state.kind]);

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    const submittedId = registrationId.trim();
    if (!submittedId) {
      setState({ kind: "error", message: "Enter your registration ID to continue." });
      return;
    }

    setState({ kind: "pending" });

    try {
      const response = await fetch(
        `/api/dev/events/${encodeURIComponent(event.slug)}/registration/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationId: submittedId }),
        },
      );

      const result = (await response.json()) as {
        ok?: boolean;
        participantName?: string;
        unavailable?: boolean;
      };

      if (!response.ok && result.unavailable) throw new Error("Service unavailable");

      if (!response.ok || !result.ok || typeof result.participantName !== "string") {
        setState({
          kind: "error",
          message: "Registration details could not be verified. Check the ID and try again.",
        });
        return;
      }

      setState({
        kind: "verified",
        participantName: result.participantName,
        registrationId: submittedId,
      });
    } catch {
      setState({
        kind: "error",
        message: "Attendance service is temporarily unavailable. Please retry or contact the event team.",
      });
    }
  }

  async function markAttendance(participantName: string, verifiedRegistrationId: string) {
    if (submissionLocked.current) return;
    submissionLocked.current = true;
    setState({ kind: event.locationEnabled ? "locating" : "submitting", participantName, registrationId: verifiedRegistrationId });

    const location = event.locationEnabled ? await requestLocation() : null;
    setState({ kind: "submitting", participantName, registrationId: verifiedRegistrationId });

    try {
      const response = await fetch(`/api/dev/events/${encodeURIComponent(event.slug)}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: verifiedRegistrationId, location }),
      });
      const result = parseAttendanceResult(await response.json());
      if (!result || result.status === "invalid") throw new Error("Check-in was not confirmed");
      setState({ kind: "result", participantName, registrationId: verifiedRegistrationId, result });
    } catch {
      submissionLocked.current = false;
      setState({
        kind: "error",
        message: "Attendance could not be recorded. Please verify your registration again and retry.",
      });
    }
  }

  if (state.kind === "result") {
    const { result } = state;

    if (isAttendanceReceipt(result)) {
      const isDuplicate = result.status === "already-recorded";
      return (
        <section ref={statePanel} tabIndex={-1} className={isDuplicate ? styles.alreadyRecorded : styles.confirmed} role="status" aria-labelledby={`${inputId}-result-title`}>
          <p className={styles.verifiedLabel}>{isDuplicate ? "Already recorded" : "Attendance confirmed"}</p>
          <h2 id={`${inputId}-result-title`}>{isDuplicate ? "Your attendance already exists" : `You're checked in, ${result.participantName}`}</h2>
          <p>{isDuplicate ? "Attendance has already been recorded for this registration." : "The server successfully recorded your attendance."}</p>
          <dl className={styles.receiptFacts}>
            <div><dt>Attendance time</dt><dd>{attendanceTimeFormatter.format(new Date(result.checkedInAt))}</dd></div>
            <div><dt>Attendance reference</dt><dd>{result.attendanceReference}</dd></div>
          </dl>
          {result.confirmationPdfUrl ? (
            <a className={styles.primaryAction} href={result.confirmationPdfUrl} download>Download confirmation PDF</a>
          ) : (
            <button className={styles.primaryAction} type="button" disabled>Confirmation PDF unavailable</button>
          )}
          {!result.confirmationPdfUrl ? <p className={styles.integrationNote}>The PDF download will activate when Member 4 provides the confirmation URL.</p> : null}
        </section>
      );
    }

    const retry = () => {
      submissionLocked.current = false;
      setState({ kind: "verified", participantName: state.participantName, registrationId: state.registrationId });
    };

    const failureContent = result.status === "locked"
      ? { label: "Temporarily locked", title: "Too many unsuccessful attempts", message: `Please retry after ${result.retryAfterSeconds} seconds.` }
      : result.status === "location-rejected"
        ? {
            label: "Location required",
            title: "Venue location could not be verified",
            message: result.locationStatus === "denied"
              ? "Allow location access and retry, or contact the event team for help."
              : result.locationStatus === "outside"
                ? "Your device appears to be outside the configured venue area. Move to the venue and retry, or contact the event team."
                : "Location is unavailable on this device. Retry or contact the event team for help.",
          }
        : result.status === "closed"
          ? { label: "Attendance closed", title: "Attendance for this event is closed", message: "The server reports that the attendance window has ended." }
          : result.status === "not-open"
            ? { label: "Not open", title: "Attendance is not open yet", message: "Wait until the event attendance window opens, then retry." }
            : { label: "Service unavailable", title: "Attendance could not be recorded", message: "Please retry or contact the event team." };

    return (
      <section ref={statePanel} tabIndex={-1} className={styles.resultError} role="alert" aria-labelledby={`${inputId}-result-title`}>
        <p className={styles.resultLabel}>{failureContent.label}</p>
        <h2 id={`${inputId}-result-title`}>{failureContent.title}</h2>
        <p>{failureContent.message}</p>
        <button className={styles.secondaryAction} type="button" onClick={retry}>Retry attendance</button>
      </section>
    );
  }

  if (state.kind === "verified" || state.kind === "locating" || state.kind === "submitting") {
    const isCompleting = state.kind !== "verified";
    return (
      <section ref={statePanel} tabIndex={-1} className={styles.verified} aria-labelledby={`${inputId}-verified-title`}>
        <p className={styles.verifiedLabel}>Registration verified</p>
        <h2 id={`${inputId}-verified-title`}>{state.participantName}</h2>
        <p>Registration ID: {state.registrationId}</p>
        <dl className={styles.previewFacts}>
          <div><dt>Event</dt><dd>{event.name}</dd></div>
          <div><dt>Date and time</dt><dd>{event.date}, {event.time}</dd></div>
          <div><dt>Venue</dt><dd>{event.venue}</dd></div>
        </dl>
        {event.locationEnabled ? (
          <p className={styles.locationNote}>Your location will be requested only when you mark attendance.</p>
        ) : null}
        <button
          className={styles.primaryAction}
          type="button"
          disabled={isCompleting}
          onClick={() => void markAttendance(state.participantName, state.registrationId)}
        >
          {state.kind === "locating"
            ? "Checking venue location…"
            : state.kind === "submitting"
              ? "Recording attendance…"
              : "Mark My Attendance"}
        </button>
        <button
          className={styles.secondaryAction}
          type="button"
          disabled={isCompleting}
          onClick={() => {
            submissionLocked.current = false;
            setRegistrationId("");
            setState({ kind: "idle" });
          }}
        >
          Use a different registration ID
        </button>
      </section>
    );
  }

  const isPending = state.kind === "pending";
  const hasError = state.kind === "error";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.heading}>
        <p className={styles.step}>Check-in</p>
        <h2>Enter your registration ID</h2>
        <p id={helpId}>Use the exact ID provided in your event registration.</p>
      </div>

      <div className={styles.field}>
        <label htmlFor={inputId}>Registration ID</label>
        <input
          id={inputId}
          name="registrationId"
          type="text"
          value={registrationId}
          onChange={(event) => {
            setRegistrationId(event.target.value);
            if (hasError) setState({ kind: "idle" });
          }}
          aria-describedby={`${helpId}${hasError ? ` ${messageId}` : ""}`}
          aria-invalid={hasError}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={isPending}
        />
      </div>

      {hasError ? (
        <p className={styles.error} id={messageId} role="alert">
          {state.message}
        </p>
      ) : null}

      <button className={styles.primaryAction} type="submit" disabled={isPending}>
        {isPending ? "Verifying registration…" : "Verify registration"}
      </button>
    </form>
  );
}
