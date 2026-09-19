import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-slate-500 mb-2" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3" aria-hidden="true" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-slate-700 hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-700 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
