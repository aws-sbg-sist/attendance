import { statusLabel, statusBadgeClass } from "@/lib/format";

interface BadgeProps {
  status: string;
}

export default function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(status)}`}
    >
      {statusLabel(status)}
    </span>
  );
}
