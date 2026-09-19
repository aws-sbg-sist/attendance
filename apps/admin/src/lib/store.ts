"use client";

/**
 * Local in-memory data store for the admin UI.
 *
 * This is intentionally a simple module-level singleton so the Technical Lead
 * can replace it with real API calls without touching any component logic.
 * All mutations return new arrays/objects — same contract as the business logic.
 *
 * Integration note: replace the functions below with fetch() calls to the
 * real API when the backend is ready.
 */

import { SEED_EVENTS, SEED_PARTICIPANTS } from "./fixtures";
import type { Event, EventStatus } from "./types";
import type { Participant } from "@participant-import/types/participant";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let events: Event[] = [...SEED_EVENTS];
let participants: Participant[] = [...SEED_PARTICIPANTS];

// ---------------------------------------------------------------------------
// Event operations
// ---------------------------------------------------------------------------

export function getEvents(): Event[] {
  return [...events];
}

export function getEvent(id: string): Event | undefined {
  return events.find((e) => e.id === id);
}

export function createEvent(event: Event): Event {
  events = [...events, event];
  return event;
}

export function updateEvent(id: string, fields: Partial<Omit<Event, "id">>): Event | undefined {
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  const updated = { ...events[idx], ...fields, id } as Event;
  events = events.map((e) => (e.id === id ? updated : e));
  return updated;
}

export function deleteEvent(id: string): boolean {
  const before = events.length;
  events = events.filter((e) => e.id !== id);
  return events.length < before;
}

export function setEventStatus(id: string, status: EventStatus): Event | undefined {
  return updateEvent(id, { status });
}

// ---------------------------------------------------------------------------
// Participant operations
// ---------------------------------------------------------------------------

export function getParticipants(eventId: string): Participant[] {
  return participants.filter((p) => p.eventId === eventId);
}

export function getParticipant(id: string): Participant | undefined {
  return participants.find((p) => p.id === id);
}

export function saveParticipant(updated: Participant): Participant {
  const exists = participants.some((p) => p.id === updated.id);
  if (exists) {
    participants = participants.map((p) => (p.id === updated.id ? updated : p));
  } else {
    participants = [...participants, updated];
  }
  return updated;
}

export function addParticipants(newParticipants: Participant[]): void {
  participants = [...participants, ...newParticipants];
}

// ---------------------------------------------------------------------------
// ID generation — deterministic enough for local fixtures
// ---------------------------------------------------------------------------

export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
