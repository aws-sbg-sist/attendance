"use client";

import { FormEvent, useId, useRef, useState } from "react";
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
  | { kind: "confirmed"; participantName: string };

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
  const [registrationId, setRegistrationId] = useState("");
  const [state, setState] = useState<FormState>({ kind: "idle" });

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
      const result = (await response.json()) as { ok?: boolean };
      if (!response.ok || !result.ok) throw new Error("Check-in was not confirmed");
      setState({ kind: "confirmed", participantName });
    } catch {
      submissionLocked.current = false;
      setState({
        kind: "error",
        message: "Attendance could not be recorded. Please verify your registration again and retry.",
      });
    }
  }

  if (state.kind === "confirmed") {
    return (
      <section className={styles.confirmed} role="status" aria-labelledby={`${inputId}-confirmed-title`}>
        <p className={styles.verifiedLabel}>Attendance confirmed</p>
        <h2 id={`${inputId}-confirmed-title`}>{state.participantName}</h2>
        <p>Your attendance was confirmed by the attendance service.</p>
      </section>
    );
  }

  if (state.kind === "verified" || state.kind === "locating" || state.kind === "submitting") {
    const isCompleting = state.kind !== "verified";
    return (
      <section className={styles.verified} aria-labelledby={`${inputId}-verified-title`}>
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
