import type { PublicEvent } from "./types";

const fixtureEvents: Record<string, PublicEvent> = {
  "aws-cloud-workshop": {
    slug: "aws-cloud-workshop",
    name: "AWS Cloud Foundations Workshop",
    venue: "Central Seminar Hall, Sathyabama Institute of Science and Technology",
    date: "2026-09-15",
    startsAt: "2026-09-15T10:00:00+05:30",
    attendanceOpensAt: "2026-09-15T09:30:00+05:30",
    attendanceClosesAt: "2026-09-15T11:00:00+05:30",
    posterUrl: null,
    status: "open",
  },
  "upcoming-event": {
    slug: "upcoming-event",
    name: "Serverless Builders Session",
    venue: "Block 5 Auditorium, Sathyabama Institute of Science and Technology",
    date: "2026-09-22",
    startsAt: "2026-09-22T14:00:00+05:30",
    attendanceOpensAt: "2026-09-22T13:30:00+05:30",
    attendanceClosesAt: "2026-09-22T15:00:00+05:30",
    posterUrl: null,
    status: "not-open",
  },
  "closed-event": {
    slug: "closed-event",
    name: "Introduction to Cloud Security",
    venue: "Main Block Conference Hall, Sathyabama Institute of Science and Technology",
    date: "2026-09-08",
    startsAt: "2026-09-08T10:00:00+05:30",
    attendanceOpensAt: "2026-09-08T09:30:00+05:30",
    attendanceClosesAt: "2026-09-08T11:00:00+05:30",
    posterUrl: null,
    status: "closed",
  },
};

export async function getFixtureEvent(slug: string): Promise<PublicEvent | null> {
  return fixtureEvents[slug] ?? null;
}
