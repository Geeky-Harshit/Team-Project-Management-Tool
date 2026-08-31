"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6">
      <div className="w-full rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
          Dashboard Error
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Could not load your organizations
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          There was an issue while loading the dashboard. Try again or go home.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Go home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-gray-400">Ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
