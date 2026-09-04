"use client";

import { FormEvent, useId, useState } from "react";
import styles from "./registration-form.module.css";

type RegistrationFormProps = {
  eventSlug: string;
};

type FormState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "error"; message: string }
  | { kind: "verified"; participantName: string; registrationId: string };

export function RegistrationForm({ eventSlug }: RegistrationFormProps) {
  const inputId = useId();
  const helpId = useId();
  const messageId = useId();
  const [registrationId, setRegistrationId] = useState("");
  const [state, setState] = useState<FormState>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submittedId = registrationId.trim();
    if (!submittedId) {
      setState({ kind: "error", message: "Enter your registration ID to continue." });
      return;
    }

    setState({ kind: "pending" });

    try {
      const response = await fetch(
        `/api/dev/events/${encodeURIComponent(eventSlug)}/registration/verify`,
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

  if (state.kind === "verified") {
    return (
      <section className={styles.verified} aria-labelledby={`${inputId}-verified-title`}>
        <p className={styles.verifiedLabel}>Registration verified</p>
        <h2 id={`${inputId}-verified-title`}>{state.participantName}</h2>
        <p>Registration ID: {state.registrationId}</p>
        <button
          className={styles.secondaryAction}
          type="button"
          onClick={() => {
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
