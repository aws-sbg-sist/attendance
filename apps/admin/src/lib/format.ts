/**
 * Small formatting helpers used across the UI.
 * No external dependencies.
 */

/** Format ISO datetime string for display, e.g. "15 Oct 2026, 09:00 AM" */
export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

/** Format ISO date string for display, e.g. "15 Oct 2026" */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Truncate an ISO datetime to the "datetime-local" input value format */
export function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  // datetime-local expects YYYY-MM-DDTHH:mm
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  } catch {
    return iso.slice(0, 16);
  }
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  closed: "Closed",
  cancelled: "Cancelled",
  active: "Active",
  disabled: "Disabled",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  closed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-800",
  disabled: "bg-slate-100 text-slate-500 line-through",
};

export function statusBadgeClass(status: string): string {
  return STATUS_BADGE[status] ?? "bg-gray-100 text-gray-700";
}

/** Slugify a string for use as an event slug */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
