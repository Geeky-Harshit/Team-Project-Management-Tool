"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function MembersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center p-6 text-center">
      <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Failed to load members</h1>
          <p className="mt-2 text-sm text-gray-600">
            {error.message || "An unexpected error occurred."}
          </p>
        </div>
        <Button
          onClick={reset}
          className="bg-primary font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
        >
          Retry
        </Button>
        {error.digest && (
          <p className="text-xs text-gray-400">Ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
