import EventForm from "@/components/EventForm";

export default function NewEventPage() {
  return (
    <EventForm
      title="Create Event"
      breadcrumbs={[
        { label: "Events", href: "/events" },
        { label: "New Event" },
      ]}
    />
  );
}
