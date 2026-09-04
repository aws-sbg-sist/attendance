import { EventLanding, getFixtureEvent } from "@attendance/checkin-experience";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getFixtureEvent(slug);

  return <EventLanding event={event} />;
}
