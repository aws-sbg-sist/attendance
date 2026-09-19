import { InboxIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <InboxIcon className="w-10 h-10 text-slate-300 mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
