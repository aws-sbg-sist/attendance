"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/store";
import type { Event } from "@/lib/types";
import EventForm from "@/components/EventForm";

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null | undefined>(undefined);

  useEffect(() => {
    const found = getEvent(eventId);
    setEvent(found ?? null);
  }, [eventId]);

  // Loading state
  if (event === undefined) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">Loading…</div>
    );
  }

  // Not found
  if (event === null) {
    notFound();
  }

  return (
    <EventForm
      existing={event}
      title="Edit Event"
      breadcrumbs={[
        { label: "Events", href: "/events" },
        { label: event.name, href: `/events/${event.id}` },
        { label: "Edit" },
      ]}
    />
  );
}
