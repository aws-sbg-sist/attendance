"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon, CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { getEvents } from "@/lib/store";
import type { Event } from "@/lib/types";
import { formatDate, statusLabel, statusBadgeClass } from "@/lib/format";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  // Load from store on mount and every time the page is focused
  // (handles navigating back after create/delete)
  useEffect(() => {
    setEvents(getEvents());
  }, []);

  return (
    <>
      <PageHeader
        title="Events"
        breadcrumbs={[{ label: "Events" }]}
        actions={
          <Link
            href="/events/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <PlusIcon className="w-4 h-4" aria-hidden="true" />
            Create Event
          </Link>
        }
      />

      {events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Create your first event to get started."
          action={
            <Link
              href="/events/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <PlusIcon className="w-4 h-4" aria-hidden="true" />
              Create Event
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
            {event.name}
          </h2>
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(event.status)}`}
          >
            {statusLabel(event.status)}
          </span>
        </div>

        <ul className="space-y-1.5">
          <li className="flex items-center gap-2 text-xs text-slate-600">
            <MapPinIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{event.venue}</span>
          </li>
          <li className="flex items-center gap-2 text-xs text-slate-600">
            <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span>{formatDate(event.date)}</span>
          </li>
        </ul>
      </div>

      {/* Card footer */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <Link
          href={`/events/${event.id}/participants`}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          <UsersIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Participants
        </Link>
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          Manage →
        </Link>
      </div>
    </div>
  );
}
