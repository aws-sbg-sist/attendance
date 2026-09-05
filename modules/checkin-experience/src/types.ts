export type PublicEventState = "open" | "not-open" | "closed";
export type TokenGateState = "valid" | "missing" | "expired" | "invalid" | "wrong-event";

export type PublicEvent = {
  id: string;
  slug: string;
  name: string;
  venue: string;
  date: string;
  startsAt: string;
  attendanceOpensAt: string;
  attendanceClosesAt: string;
  posterUrl: string | null;
  brochureUrl: string | null;
  venueLat: number | null;
  venueLng: number | null;
  venueRadiusM: number | null;
  status: PublicEventState;
};
