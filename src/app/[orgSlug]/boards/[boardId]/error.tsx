"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function BoardErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ orgSlug: string }>();
  const boardsHref = params.orgSlug ? `/${params.orgSlug}/boards` : "/dashboard";

  useEffect(() => {
    console.error("Board route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center p-6 text-center">
      <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Could not load this board</h1>
          <p className="mt-2 text-sm text-gray-600">
            There was an issue while loading the Kanban board. Retry or return to the boards list.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={reset}
            className="bg-primary font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            Retry
          </Button>
          <Link href={boardsHref}>
            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
              Back to boards
            </Button>
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-gray-400">Ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
