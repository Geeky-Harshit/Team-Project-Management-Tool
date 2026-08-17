"use client";

import { useEffect } from "react";

export default function OrgErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Org route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6">
      <div className="w-full rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
          Workspace Error
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Could not load workspace
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          There was an issue while loading organization data.
        </p>

        <div className="mt-6">
          <button
            onClick={reset}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Retry
          </button>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-gray-400">Ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}