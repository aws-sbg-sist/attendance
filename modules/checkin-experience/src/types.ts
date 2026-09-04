export type PublicEventState = "open" | "not-open" | "closed";

export type PublicEvent = {
  slug: string;
  name: string;
  venue: string;
  date: string;
  startsAt: string;
  attendanceOpensAt: string;
  attendanceClosesAt: string;
  posterUrl: string | null;
  status: PublicEventState;
};
