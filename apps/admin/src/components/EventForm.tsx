"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event, EventStatus } from "@/lib/types";
import { createEvent, updateEvent, generateId } from "@/lib/store";
import { slugify, toDatetimeLocal } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import type { Breadcrumb } from "@/components/PageHeader";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormFields {
  name: string;
  venue: string;
  venueLat: string;
  venueLng: string;
  venueRadiusM: string;
  date: string;
  startsAt: string;
  attendanceOpensAt: string;
  attendanceClosesAt: string;
  posterUrl: string;
  brochureUrl: string;
  status: EventStatus;
}

interface FieldErrors {
  [key: string]: string;
}

interface EventFormProps {
  /** Pass an existing event to pre-populate (edit mode). Omit for create mode. */
  existing?: Event;
  breadcrumbs: Breadcrumb[];
  title: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function eventToFields(event: Event): FormFields {
  return {
    name: event.name,
    venue: event.venue,
    venueLat: String(event.venueLat),
    venueLng: String(event.venueLng),
    venueRadiusM: String(event.venueRadiusM),
    date: event.date,
    startsAt: toDatetimeLocal(event.startsAt),
    attendanceOpensAt: toDatetimeLocal(event.attendanceOpensAt),
    attendanceClosesAt: toDatetimeLocal(event.attendanceClosesAt),
    posterUrl: event.posterUrl,
    brochureUrl: event.brochureUrl,
    status: event.status,
  };
}

const emptyFields: FormFields = {
  name: "",
  venue: "",
  venueLat: "",
  venueLng: "",
  venueRadiusM: "150",
  date: "",
  startsAt: "",
  attendanceOpensAt: "",
  attendanceClosesAt: "",
  posterUrl: "",
  brochureUrl: "",
  status: "draft",
};

function validate(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name.trim()) errors.name = "Event name is required.";
  if (!fields.venue.trim()) errors.venue = "Venue is required.";
  if (!fields.date) errors.date = "Date is required.";
  if (!fields.startsAt) errors.startsAt = "Start time is required.";
  if (!fields.attendanceOpensAt) errors.attendanceOpensAt = "Attendance open time is required.";
  if (!fields.attendanceClosesAt) errors.attendanceClosesAt = "Attendance close time is required.";

  const lat = parseFloat(fields.venueLat);
  const lng = parseFloat(fields.venueLng);
  const radius = parseInt(fields.venueRadiusM, 10);

  if (fields.venueLat && (isNaN(lat) || lat < -90 || lat > 90))
    errors.venueLat = "Latitude must be between -90 and 90.";
  if (fields.venueLng && (isNaN(lng) || lng < -180 || lng > 180))
    errors.venueLng = "Longitude must be between -180 and 180.";
  if (fields.venueRadiusM && (isNaN(radius) || radius < 1))
    errors.venueRadiusM = "Radius must be a positive number.";

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function EventForm({ existing, breadcrumbs, title }: EventFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState<FormFields>(
    existing ? eventToFields(existing) : emptyFields
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function set(key: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Clear the error for this field on change
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    const eventData: Omit<Event, "id" | "slug"> = {
      name: fields.name.trim(),
      venue: fields.venue.trim(),
      venueLat: parseFloat(fields.venueLat) || 0,
      venueLng: parseFloat(fields.venueLng) || 0,
      venueRadiusM: parseInt(fields.venueRadiusM, 10) || 150,
      date: fields.date,
      startsAt: fields.startsAt ? new Date(fields.startsAt).toISOString() : "",
      attendanceOpensAt: fields.attendanceOpensAt
        ? new Date(fields.attendanceOpensAt).toISOString()
        : "",
      attendanceClosesAt: fields.attendanceClosesAt
        ? new Date(fields.attendanceClosesAt).toISOString()
        : "",
      posterUrl: fields.posterUrl.trim(),
      brochureUrl: fields.brochureUrl.trim(),
      status: fields.status,
    };

    if (existing) {
      updateEvent(existing.id, eventData);
      router.push(`/events/${existing.id}`);
    } else {
      const id = generateId("evt");
      createEvent({
        id,
        slug: slugify(fields.name),
        ...eventData,
      });
      router.push(`/events/${id}`);
    }
  }

  return (
    <>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />

      <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-2xl">
        {/* Event information */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
            Event information
          </h2>
          <div className="space-y-4">
            <Field label="Event name" error={errors.name} required>
              <input
                type="text"
                value={fields.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. TechNova 2026"
                className={inputCls(!!errors.name)}
              />
            </Field>

            <Field label="Venue" error={errors.venue} required>
              <input
                type="text"
                value={fields.venue}
                onChange={(e) => set("venue", e.target.value)}
                placeholder="e.g. Sathyabama Institute of Science and Technology"
                className={inputCls(!!errors.venue)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" error={errors.date} required>
                <input
                  type="date"
                  value={fields.date}
                  onChange={(e) => set("date", e.target.value)}
                  className={inputCls(!!errors.date)}
                />
              </Field>

              <Field label="Starts at" error={errors.startsAt} required>
                <input
                  type="datetime-local"
                  value={fields.startsAt}
                  onChange={(e) => set("startsAt", e.target.value)}
                  className={inputCls(!!errors.startsAt)}
                />
              </Field>
            </div>

            <Field label="Status">
              <select
                value={fields.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputCls(false)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        {/* Attendance window */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
            Attendance window
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Opens at" error={errors.attendanceOpensAt} required>
              <input
                type="datetime-local"
                value={fields.attendanceOpensAt}
                onChange={(e) => set("attendanceOpensAt", e.target.value)}
                className={inputCls(!!errors.attendanceOpensAt)}
              />
            </Field>

            <Field label="Closes at" error={errors.attendanceClosesAt} required>
              <input
                type="datetime-local"
                value={fields.attendanceClosesAt}
                onChange={(e) => set("attendanceClosesAt", e.target.value)}
                className={inputCls(!!errors.attendanceClosesAt)}
              />
            </Field>
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
            Location
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Latitude" error={errors.venueLat}>
              <input
                type="number"
                step="any"
                value={fields.venueLat}
                onChange={(e) => set("venueLat", e.target.value)}
                placeholder="12.8698"
                className={inputCls(!!errors.venueLat)}
              />
            </Field>

            <Field label="Longitude" error={errors.venueLng}>
              <input
                type="number"
                step="any"
                value={fields.venueLng}
                onChange={(e) => set("venueLng", e.target.value)}
                placeholder="80.2195"
                className={inputCls(!!errors.venueLng)}
              />
            </Field>

            <Field label="Radius (m)" error={errors.venueRadiusM}>
              <input
                type="number"
                value={fields.venueRadiusM}
                onChange={(e) => set("venueRadiusM", e.target.value)}
                placeholder="150"
                className={inputCls(!!errors.venueRadiusM)}
              />
            </Field>
          </div>
        </section>

        {/* Assets */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
            Assets
          </h2>
          <div className="space-y-4">
            <Field label="Poster URL">
              <input
                type="url"
                value={fields.posterUrl}
                onChange={(e) => set("posterUrl", e.target.value)}
                placeholder="https://..."
                className={inputCls(false)}
              />
            </Field>

            <Field label="Brochure URL">
              <input
                type="url"
                value={fields.brochureUrl}
                onChange={(e) => set("brochureUrl", e.target.value)}
                placeholder="https://..."
                className={inputCls(false)}
              />
            </Field>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {submitting ? "Saving…" : existing ? "Save changes" : "Create event"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function inputCls(hasError: boolean) {
  return [
    "block w-full px-3 py-2 text-sm border rounded-md shadow-sm",
    "focus:outline-none focus:ring-2",
    hasError
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-300 focus:ring-indigo-400",
  ].join(" ");
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
