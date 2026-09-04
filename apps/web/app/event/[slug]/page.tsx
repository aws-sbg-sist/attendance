import {
  EventLanding,
  getFixtureEvent,
} from "@attendance/checkin-experience";
import { cookies } from "next/headers";
import { GATE_COOKIE_NAME, readGateCookie } from "../../../lib/gate-session.mjs";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const [event, cookieStore] = await Promise.all([getFixtureEvent(slug), cookies()]);
  const tokenGate = readGateCookie(cookieStore.get(GATE_COOKIE_NAME)?.value, slug);

  return <EventLanding event={event} tokenGate={tokenGate} />;
}
