"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  ChevronLeftIcon,
} from "lucide-react";
import { getParticipants, getEvent, addParticipants, generateId } from "@/lib/store";
import type { Event } from "@/lib/types";
import { importParticipants } from "@participant-import/import-participants";
import type { ImportResult } from "@participant-import/import-participants";
import type { Participant } from "@participant-import/types/participant";
import PageHeader from "@/components/PageHeader";

// ---------------------------------------------------------------------------
// Stage machine
// ---------------------------------------------------------------------------
type Stage = "select" | "preview" | "done";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ImportPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [stage, setStage] = useState<Stage>("select");

  // Preview state
  const [csvText, setCsvText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<ImportResult | null>(null);
  const [existingParticipants, setExistingParticipants] = useState<Participant[]>([]);

  // Report state (after confirmed import)
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ev = getEvent(eventId);
    setEvent(ev ?? null);
    setExistingParticipants(getParticipants(eventId));
  }, [eventId]);

  // -------------------------------------------------------------------------
  // File selection → parse → preview
  // -------------------------------------------------------------------------

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    setPreviewResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      try {
        const result = importParticipants(text, existingParticipants, {
          eventId,
          generateParticipantId: () => generateId("p"),
        });
        setPreviewResult(result);
        setStage("preview");
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Failed to parse CSV.");
      }
    };
    reader.readAsText(file);
  }

  // -------------------------------------------------------------------------
  // Confirm import
  // -------------------------------------------------------------------------

  function handleConfirmImport() {
    if (!previewResult) return;

    // Re-run import to get fresh normalized participants
    // (previewResult.participantsToCreate already has them, but we re-derive
    //  to be safe in case existing participants changed)
    let result: ImportResult;
    try {
      result = importParticipants(csvText, existingParticipants, {
        eventId,
        generateParticipantId: () => generateId("p"),
      });
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Unexpected error.");
      return;
    }

    addParticipants(result.participantsToCreate);
    setImportResult(result);
    // Refresh existing participants so the list reflects new additions
    setExistingParticipants(getParticipants(eventId));
    setStage("done");
  }

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------

  function handleReset() {
    setStage("select");
    setCsvText("");
    setFileName("");
    setParseError(null);
    setPreviewResult(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      <PageHeader
        title="Import Participants"
        breadcrumbs={[
          { label: "Events", href: "/events" },
          { label: event?.name ?? "…", href: `/events/${eventId}` },
          { label: "Participants", href: `/events/${eventId}/participants` },
          { label: "Import" },
        ]}
      />

      {/* Step indicator */}
      <StepIndicator stage={stage} />

      <div className="mt-6 max-w-3xl">
        {/* ----------------------------------------------------------------- */}
        {/* Stage: select                                                       */}
        {/* ----------------------------------------------------------------- */}
        {stage === "select" && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
                <UploadIcon className="w-6 h-6 text-indigo-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Select a CSV file</p>
                <p className="text-xs text-slate-500 mt-1">
                  Required columns:{" "}
                  <code className="bg-slate-100 px-1 rounded">
                    registrationId, name, email, phone, college, department, section, year
                  </code>
                </p>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus-within:ring-2 focus-within:ring-indigo-500">
                <FileTextIcon className="w-4 h-4" aria-hidden="true" />
                Choose file
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-label="Choose CSV file"
                />
              </label>

              {parseError && (
                <div className="w-full rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-left">
                  <span className="font-medium">Parse error:</span> {parseError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Stage: preview                                                      */}
        {/* ----------------------------------------------------------------- */}
        {stage === "preview" && previewResult && (
          <div className="space-y-5">
            {/* File info */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileTextIcon className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span className="font-medium">{fileName}</span>
            </div>

            {/* Summary banner */}
            <ImportSummaryBanner result={previewResult} />

            {/* Validation errors */}
            {previewResult.validationErrors.length > 0 && (
              <CollapsibleSection
                title={`Validation errors (${previewResult.validationErrors.length})`}
                variant="error"
                defaultOpen
              >
                <table className="min-w-full text-xs divide-y divide-red-100">
                  <thead>
                    <tr className="text-left text-red-600 font-medium">
                      <th className="pb-1 pr-4">Row</th>
                      <th className="pb-1 pr-4">Field</th>
                      <th className="pb-1">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {previewResult.validationErrors.map((err, i) => (
                      <tr key={i}>
                        <td className="py-1 pr-4 font-mono">{err.row}</td>
                        <td className="py-1 pr-4">{err.field}</td>
                        <td className="py-1 text-slate-700">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CollapsibleSection>
            )}

            {/* Duplicates */}
            {previewResult.duplicates.length > 0 && (
              <CollapsibleSection
                title={`Skipped rows — duplicates (${previewResult.duplicates.length})`}
                variant="warning"
                defaultOpen
              >
                <table className="min-w-full text-xs divide-y divide-yellow-100">
                  <thead>
                    <tr className="text-left text-yellow-700 font-medium">
                      <th className="pb-1 pr-4">Row</th>
                      <th className="pb-1 pr-4">Reg. ID</th>
                      <th className="pb-1">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yellow-50">
                    {previewResult.duplicates.map((dup, i) => (
                      <tr key={i}>
                        <td className="py-1 pr-4 font-mono">{dup.row}</td>
                        <td className="py-1 pr-4 font-mono">{dup.registrationId}</td>
                        <td className="py-1 text-slate-700">
                          {dup.reason === "duplicate-in-file"
                            ? "Duplicate within this file"
                            : "Already registered"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CollapsibleSection>
            )}

            {/* Rows to import */}
            {previewResult.participantsToCreate.length > 0 && (
              <CollapsibleSection
                title={`Rows to import (${previewResult.participantsToCreate.length})`}
                variant="success"
                defaultOpen
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs divide-y divide-green-100">
                    <thead>
                      <tr className="text-left text-green-700 font-medium">
                        {["Reg. ID", "Name", "Email", "College", "Dept", "Year"].map((h) => (
                          <th key={h} className="pb-1 pr-4 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-50">
                      {previewResult.participantsToCreate.map((p) => (
                        <tr key={p.registrationId}>
                          <td className="py-1 pr-4 font-mono">{p.registrationId}</td>
                          <td className="py-1 pr-4">{p.name}</td>
                          <td className="py-1 pr-4">{p.email}</td>
                          <td className="py-1 pr-4 max-w-[160px] truncate">{p.college}</td>
                          <td className="py-1 pr-4">{p.department}</td>
                          <td className="py-1 pr-4">{p.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CollapsibleSection>
            )}

            {previewResult.participantsToCreate.length === 0 && (
              <div className="rounded-md bg-slate-50 border border-slate-200 px-4 py-4 text-sm text-slate-600">
                No valid rows to import. Fix the errors above and try again.
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              {previewResult.participantsToCreate.length > 0 && (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Confirm import ({previewResult.participantsToCreate.length} participant
                  {previewResult.participantsToCreate.length !== 1 ? "s" : ""})
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Choose different file
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Stage: done — import report (task 9)                               */}
        {/* ----------------------------------------------------------------- */}
        {stage === "done" && importResult && (
          <ImportReport
            result={importResult}
            eventId={eventId}
            onImportAnother={handleReset}
          />
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ stage }: { stage: Stage }) {
  const steps = [
    { key: "select", label: "Select file" },
    { key: "preview", label: "Preview & validate" },
    { key: "done", label: "Import report" },
  ] as const;

  const idx = steps.findIndex((s) => s.key === stage);

  return (
    <nav aria-label="Import steps" className="flex items-center gap-0">
      {steps.map((step, i) => {
        const completed = i < idx;
        const active = i === idx;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${
                  completed
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : active
                    ? "border-indigo-600 text-indigo-600"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                {completed ? "✓" : i + 1}
              </span>
              <span
                className={`text-xs font-medium ${
                  active ? "text-indigo-700" : completed ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-8 h-px bg-slate-200 mx-2" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Summary banner (preview stage)
// ---------------------------------------------------------------------------

function ImportSummaryBanner({ result }: { result: ImportResult }) {
  const items = [
    { label: "Total rows", value: result.totalRows, color: "text-slate-700" },
    { label: "Valid", value: result.validRows.length, color: "text-green-700" },
    {
      label: "Invalid",
      value: result.validationErrors.length,
      color: result.validationErrors.length > 0 ? "text-red-700" : "text-slate-500",
    },
    {
      label: "Duplicates",
      value: result.duplicates.length,
      color: result.duplicates.length > 0 ? "text-yellow-700" : "text-slate-500",
    },
    {
      label: "Will import",
      value: result.participantsToCreate.length,
      color: result.participantsToCreate.length > 0 ? "text-indigo-700" : "text-slate-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-lg border border-slate-200 px-4 py-3 text-center"
        >
          <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsible section
// ---------------------------------------------------------------------------

function CollapsibleSection({
  title,
  variant,
  defaultOpen,
  children,
}: {
  title: string;
  variant: "error" | "warning" | "success" | "neutral";
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);

  const colors = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    success: "bg-green-50 border-green-200 text-green-800",
    neutral: "bg-slate-50 border-slate-200 text-slate-700",
  };

  const icon = {
    error: <XCircleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />,
    warning: <AlertTriangleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />,
    success: <CheckCircleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />,
    neutral: null,
  };

  return (
    <div className={`rounded-lg border ${colors[variant]} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {icon[variant]}
          {title}
        </span>
        <span className="text-xs opacity-60">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 pb-4 overflow-x-auto">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Import report — task 9
// ---------------------------------------------------------------------------

function ImportReport({
  result,
  eventId,
  onImportAnother,
}: {
  result: ImportResult;
  eventId: string;
  onImportAnother: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Success banner */}
      <div className="rounded-lg bg-green-50 border border-green-200 px-5 py-4 flex items-start gap-3">
        <CheckCircleIcon className="w-5 h-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-green-800">Import complete</p>
          <p className="text-xs text-green-700 mt-0.5">
            {result.participantsToCreate.length} participant
            {result.participantsToCreate.length !== 1 ? "s" : ""} added to the event.
          </p>
        </div>
      </div>

      {/* Result breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Import summary</h2>
        </div>
        <dl className="divide-y divide-slate-100">
          {[
            { label: "Total rows in file", value: result.totalRows },
            { label: "Imported", value: result.participantsToCreate.length },
            { label: "Validation errors", value: result.validationErrors.length },
            {
              label: "Duplicates in file",
              value: result.duplicates.filter((d) => d.reason === "duplicate-in-file").length,
            },
            {
              label: "Already registered",
              value: result.duplicates.filter((d) => d.reason === "already-registered").length,
            },
          ].map((row) => (
            <div key={row.label} className="px-5 py-3 flex items-center justify-between">
              <dt className="text-sm text-slate-600">{row.label}</dt>
              <dd className="text-sm font-semibold text-slate-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Validation errors detail */}
      {result.validationErrors.length > 0 && (
        <CollapsibleSection
          title={`Validation errors — rows not imported (${result.validationErrors.length})`}
          variant="error"
          defaultOpen={false}
        >
          <table className="min-w-full text-xs divide-y divide-red-100">
            <thead>
              <tr className="text-left text-red-700 font-medium">
                <th className="pb-1 pr-4">Row</th>
                <th className="pb-1 pr-4">Field</th>
                <th className="pb-1">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-50">
              {result.validationErrors.map((err, i) => (
                <tr key={i}>
                  <td className="py-1 pr-4 font-mono">{err.row}</td>
                  <td className="py-1 pr-4">{err.field}</td>
                  <td className="py-1 text-slate-700">{err.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      )}

      {/* Duplicate rows detail */}
      {result.duplicates.length > 0 && (
        <CollapsibleSection
          title={`Skipped rows — duplicates (${result.duplicates.length})`}
          variant="warning"
          defaultOpen={false}
        >
          <table className="min-w-full text-xs divide-y divide-yellow-100">
            <thead>
              <tr className="text-left text-yellow-700 font-medium">
                <th className="pb-1 pr-4">Row</th>
                <th className="pb-1 pr-4">Reg. ID</th>
                <th className="pb-1">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-50">
              {result.duplicates.map((dup, i) => (
                <tr key={i}>
                  <td className="py-1 pr-4 font-mono">{dup.row}</td>
                  <td className="py-1 pr-4 font-mono">{dup.registrationId}</td>
                  <td className="py-1 text-slate-700">
                    {dup.reason === "duplicate-in-file"
                      ? "Duplicate within this file"
                      : "Already registered for this event"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Link
          href={`/events/${eventId}/participants`}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <ChevronLeftIcon className="w-4 h-4" aria-hidden="true" />
          View participant list
        </Link>
        <button
          type="button"
          onClick={onImportAnother}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          Import another file
        </button>
      </div>
    </div>
  );
}
