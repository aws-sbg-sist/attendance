"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import type { Participant } from "@participant-import/types/participant";
import { updateParticipant } from "@participant-import/participant-management/update-participant";
import type { ParticipantUpdateFields } from "@participant-import/participant-management/update-participant";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditParticipantModalProps {
  participant: Participant;
  onSave: (updated: Participant) => void;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  section: string;
  year: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditParticipantModal({
  participant,
  onSave,
  onClose,
}: EditParticipantModalProps) {
  const [form, setForm] = useState<FormState>({
    name: participant.name,
    email: participant.email,
    phone: participant.phone,
    college: participant.college,
    department: participant.department,
    section: participant.section,
    year: String(participant.year),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const yearNum = form.year.trim() === "" ? undefined : Number(form.year);

    const fields: ParticipantUpdateFields = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      college: form.college,
      department: form.department,
      section: form.section,
      ...(form.year.trim() !== "" ? { year: yearNum } : {}),
    };

    // Delegate validation to the existing module function — no duplication
    const result = updateParticipant(participant, fields);

    if (!result.success) {
      const errs: Record<string, string> = {};
      result.errors?.forEach((err) => { errs[err.field] = err.message; });
      setErrors(errs);
      return;
    }

    onSave(result.participant!);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Edit participant</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reg. ID:{" "}
              <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">
                {participant.registrationId}
              </code>{" "}
              — ID and registration ID cannot be changed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Close"
          >
            <XIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <form
          id="edit-participant-form"
          onSubmit={handleSubmit}
          noValidate
          className="overflow-y-auto px-6 py-5 space-y-4 flex-1"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" error={errors.name} required colSpan="col-span-2">
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputCls(!!errors.name)}
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={inputCls(!!errors.email)}
              />
            </Field>

            <Field label="Phone" error={errors.phone}>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputCls(!!errors.phone)}
              />
            </Field>

            <Field label="College" error={errors.college} colSpan="col-span-2">
              <input
                type="text"
                value={form.college}
                onChange={(e) => set("college", e.target.value)}
                className={inputCls(!!errors.college)}
              />
            </Field>

            <Field label="Department" error={errors.department}>
              <input
                type="text"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                className={inputCls(!!errors.department)}
              />
            </Field>

            <Field label="Section" error={errors.section}>
              <input
                type="text"
                value={form.section}
                onChange={(e) => set("section", e.target.value)}
                className={inputCls(!!errors.section)}
              />
            </Field>

            <Field label="Year" error={errors.year}>
              <input
                type="number"
                min={1}
                max={10}
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
                className={inputCls(!!errors.year)}
              />
            </Field>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-participant-form"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
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
  colSpan,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  colSpan?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={colSpan}>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
