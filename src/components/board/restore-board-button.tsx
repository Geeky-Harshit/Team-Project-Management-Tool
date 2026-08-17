"use client";

import { useTransition } from "react";
import { restoreBoard } from "@/actions/boards-action";
import { RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RestoreBoardButtonProps {
  boardId: string;
  orgId: string;
  boardName: string;
}

export default function RestoreBoardButton({
  boardId,
  orgId,
  boardName,
}: RestoreBoardButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    startTransition(async () => {
      try {
        await restoreBoard(boardId, orgId);
        toast.success(`Board "${boardName}" restored successfully`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to restore board");
      }
    });
  };

  return (
    <button
      onClick={handleRestore}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Restoring...
        </>
      ) : (
        <>
          <RotateCcw className="h-3.5 w-3.5" />
          Restore
        </>
      )}
    </button>
  );
}
