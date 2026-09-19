"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  SearchIcon,
  UploadIcon,
  PencilIcon,
  BanIcon,
  ChevronLeftIcon,
} from "lucide-react";
import { getParticipants, getEvent, saveParticipant } from "@/lib/store";
import type { Event } from "@/lib/types";
import type { Participant } from "@participant-import/types/participant";
import { searchParticipants } from "@participant-import/participant-management/search-participants";
import { deactivateParticipant } from "@participant-import/participant-management/deactivate-participant";
import { statusBadgeClass, statusLabel } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditParticipantModal from "./EditParticipantModal";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ParticipantsPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
  const [editTarget, setEditTarget] = useState<Participant | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Participant | null>(null);

  const load = useCallback(() => {
    const ev = getEvent(eventId);
    setEvent(ev ?? null);
    setAllParticipants(getParticipants(eventId));
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  // Search using the existing module function — never duplicate the algorithm
  const displayed = searchParticipants(allParticipants, query);

  // -------------------------------------------------------------------------
  // Deactivate handler
  // -------------------------------------------------------------------------
  function handleDeactivate() {
    if (!deactivateTarget) return;
    const updated = deactivateParticipant(deactivateTarget);
    saveParticipant(updated);
    setAllParticipants((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setDeactivateTarget(null);
  }

  // -------------------------------------------------------------------------
  // After edit save
  // -------------------------------------------------------------------------
  function handleEditSave(updated: Participant) {
    saveParticipant(updated);
    setAllParticipants((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setEditTarget(null);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (!event) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading…</div>;
  }

  return (
    <>
      <PageHeader
        title="Participants"
        breadcrumbs={[
          { label: "Events", href: "/events" },
          { label: event.name, href: `/events/${eventId}` },
          { label: "Participants" },
        ]}
        actions={
          <Link
            href={`/events/${eventId}/participants/import`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <UploadIcon className="w-4 h-4" aria-hidden="true" />
            Import CSV
          </Link>
        }
      />

      {/* Search + summary bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or registration ID…"
            className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Search participants"
          />
        </div>
        <p className="text-xs text-slate-500 shrink-0">
          {displayed.length === allParticipants.length
            ? `${allParticipants.length} participant${allParticipants.length !== 1 ? "s" : ""}`
            : `${displayed.length} of ${allParticipants.length} shown`}
        </p>
      </div>

      {/* Table */}
      {allParticipants.length === 0 ? (
        <EmptyState
          title="No participants yet"
          description="Import a CSV file to add participants to this event."
          action={
            <Link
              href={`/events/${eventId}/participants/import`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <UploadIcon className="w-4 h-4" aria-hidden="true" />
              Import CSV
            </Link>
          }
        />
      ) : displayed.length === 0 ? (
        <EmptyState
          title="No results"
          description={`No participants match "${query}".`}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Reg. ID", "Name", "Email", "College", "Dept", "Year", "Status", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map((p) => (
                  <ParticipantRow
                    key={p.id}
                    participant={p}
                    onEdit={() => setEditTarget(p)}
                    onDeactivate={() => setDeactivateTarget(p)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mt-6">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ChevronLeftIcon className="w-4 h-4" aria-hidden="true" />
          Back to event
        </Link>
      </div>

      {/* Edit modal */}
      {editTarget && (
        <EditParticipantModal
          participant={editTarget}
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Deactivate confirm */}
      {deactivateTarget && (
        <ConfirmDialog
          title="Disable participant"
          message={`Disable ${deactivateTarget.name} (${deactivateTarget.registrationId})? They will remain in the list but be marked as disabled.`}
          confirmLabel="Disable"
          destructive
          onConfirm={handleDeactivate}
          onCancel={() => setDeactivateTarget(null)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------

function ParticipantRow({
  participant: p,
  onEdit,
  onDeactivate,
}: {
  participant: Participant;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const isDisabled = p.status === "disabled";

  return (
    <tr className={isDisabled ? "opacity-60" : undefined}>
      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
        {p.registrationId}
      </td>
      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{p.name}</td>
      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.email}</td>
      <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{p.college}</td>
      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.department}</td>
      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.year}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(p.status)}`}
        >
          {statusLabel(p.status)}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label={`Edit ${p.name}`}
          >
            <PencilIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          {!isDisabled && (
            <button
              type="button"
              onClick={onDeactivate}
              className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label={`Disable ${p.name}`}
            >
              <BanIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
