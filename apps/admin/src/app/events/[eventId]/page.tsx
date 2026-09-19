"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  PencilIcon,
  UsersIcon,
  UploadIcon,
  Trash2Icon,
  LockIcon,
  UnlockIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
} from "lucide-react";
import { getEvent, deleteEvent, setEventStatus, getParticipants } from "@/lib/store";
import type { Event } from "@/lib/types";
import { formatDate, formatDateTime, statusLabel, statusBadgeClass } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-slate-100 last:border-0">
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide pt-0.5">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type ConfirmMode = "delete" | "open" | "close" | null;

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null | undefined>(undefined);
  const [participantCount, setParticipantCount] = useState(0);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null);

  useEffect(() => {
    const found = getEvent(eventId);
    setEvent(found ?? null);
    if (found) setParticipantCount(getParticipants(eventId).length);
  }, [eventId]);

  if (event === undefined) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading…</div>;
  }

  if (event === null) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-600 mb-3">Event not found.</p>
        <Link href="/events" className="text-sm text-indigo-600 hover:underline">
          ← Back to events
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleDelete() {
    deleteEvent(eventId);
    router.push("/events");
  }

  function handleOpen() {
    const updated = setEventStatus(eventId, "published");
    if (updated) setEvent(updated);
    setConfirmMode(null);
  }

  function handleClose() {
    const updated = setEventStatus(eventId, "closed");
    if (updated) setEvent(updated);
    setConfirmMode(null);
  }

  const canOpen = event.status === "draft" || event.status === "closed";
  const canClose = event.status === "published";

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      <PageHeader
        title={event.name}
        breadcrumbs={[
          { label: "Events", href: "/events" },
          { label: event.name },
        ]}
        actions={
          <Link
            href={`/events/${event.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <PencilIcon className="w-3.5 h-3.5" aria-hidden="true" />
            Edit
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---- Left: details ---- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core details */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Event details</h2>
            </div>
            <dl className="px-5">
              <DetailRow label="Status">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(event.status)}`}
                >
                  {statusLabel(event.status)}
                </span>
              </DetailRow>

              <DetailRow label="Venue">
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  {event.venue}
                </span>
              </DetailRow>

              <DetailRow label="Date">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  {formatDate(event.date)}
                </span>
              </DetailRow>

              <DetailRow label="Starts at">
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  {formatDateTime(event.startsAt)}
                </span>
              </DetailRow>

              <DetailRow label="Slug">
                <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{event.slug}</code>
              </DetailRow>
            </dl>
          </div>

          {/* Attendance window */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Attendance window</h2>
            </div>
            <dl className="px-5">
              <DetailRow label="Opens at">{formatDateTime(event.attendanceOpensAt)}</DetailRow>
              <DetailRow label="Closes at">{formatDateTime(event.attendanceClosesAt)}</DetailRow>
            </dl>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Location</h2>
            </div>
            <dl className="px-5">
              <DetailRow label="Latitude">{event.venueLat}</DetailRow>
              <DetailRow label="Longitude">{event.venueLng}</DetailRow>
              <DetailRow label="Radius">{event.venueRadiusM} m</DetailRow>
            </dl>
          </div>
        </div>

        {/* ---- Right: actions ---- */}
        <div className="space-y-4">
          {/* Participants card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Participants</h2>
            <p className="text-2xl font-bold text-slate-900 mb-4">{participantCount}</p>
            <div className="space-y-2">
              <Link
                href={`/events/${event.id}/participants`}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100"
              >
                <UsersIcon className="w-4 h-4 text-slate-500" aria-hidden="true" />
                Manage participants
              </Link>
              <Link
                href={`/events/${event.id}/participants/import`}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100"
              >
                <UploadIcon className="w-4 h-4 text-slate-500" aria-hidden="true" />
                Import CSV
              </Link>
            </div>
          </div>

          {/* Event actions card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Actions</h2>
            <div className="space-y-2">
              {canOpen && (
                <button
                  type="button"
                  onClick={() => setConfirmMode("open")}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                >
                  <UnlockIcon className="w-4 h-4" aria-hidden="true" />
                  Open event
                </button>
              )}

              {canClose && (
                <button
                  type="button"
                  onClick={() => setConfirmMode("close")}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100"
                >
                  <LockIcon className="w-4 h-4" aria-hidden="true" />
                  Close event
                </button>
              )}

              <button
                type="button"
                onClick={() => setConfirmMode("delete")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
              >
                <Trash2Icon className="w-4 h-4" aria-hidden="true" />
                Delete event
              </button>
            </div>
          </div>

          {/* Assets */}
          {(event.posterUrl || event.brochureUrl) && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Assets</h2>
              <div className="space-y-2">
                {event.posterUrl && (
                  <a
                    href={event.posterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-indigo-600 hover:underline truncate"
                  >
                    Poster →
                  </a>
                )}
                {event.brochureUrl && (
                  <a
                    href={event.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-indigo-600 hover:underline truncate"
                  >
                    Brochure →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Confirm dialogs ---- */}
      {confirmMode === "delete" && (
        <ConfirmDialog
          title="Delete event"
          message={`Are you sure you want to delete "${event.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setConfirmMode(null)}
        />
      )}

      {confirmMode === "open" && (
        <ConfirmDialog
          title="Open event"
          message={`This will publish "${event.name}" and make it visible. Continue?`}
          confirmLabel="Open event"
          onConfirm={handleOpen}
          onCancel={() => setConfirmMode(null)}
        />
      )}

      {confirmMode === "close" && (
        <ConfirmDialog
          title="Close event"
          message={`This will close "${event.name}" and stop attendance tracking. Continue?`}
          confirmLabel="Close event"
          onConfirm={handleClose}
          onCancel={() => setConfirmMode(null)}
        />
      )}
    </>
  );
}
