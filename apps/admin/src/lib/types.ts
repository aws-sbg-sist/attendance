// Event shape — matches the fixture contract and the Technical Lead's shared contract
export interface Event {
  id: string;
  slug: string;
  name: string;
  venue: string;
  venueLat: number;
  venueLng: number;
  venueRadiusM: number;
  date: string;            // ISO date string YYYY-MM-DD
  startsAt: string;        // ISO datetime string
  attendanceOpensAt: string;
  attendanceClosesAt: string;
  posterUrl: string;
  brochureUrl: string;
  status: EventStatus;
}

export type EventStatus = "draft" | "published" | "closed" | "cancelled";

// Re-export from module so the rest of the UI imports from one place
export type { Participant } from "@participant-import/types/participant";
