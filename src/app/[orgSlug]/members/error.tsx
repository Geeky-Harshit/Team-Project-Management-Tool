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
    <div className="max-w-md mx-auto my-16 p-6 rounded-2xl border border-red-200 bg-red-50/50 text-center flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">Failed to load members</h3>
        <p className="mt-1 text-xs text-gray-600">{error.message || "An unexpected error occurred."}</p>
      </div>
      <Button onClick={reset} size="sm" variant="outline" className="border-red-200 hover:bg-red-100 text-red-700">
        Try Again
      </Button>
    </div>
  );
}
