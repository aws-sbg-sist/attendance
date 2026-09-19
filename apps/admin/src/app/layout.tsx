import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Attendance Admin",
  description: "AWS Student Builder Group — Event Attendance Platform Admin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {/* Top nav */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800 tracking-tight">
              Attendance Admin
            </span>
            <span className="text-xs text-slate-400">Member 1 — feature/member-1-import</span>
          </div>
        </header>

        {/* Page content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
