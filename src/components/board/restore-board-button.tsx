"use client";

import { restoreBoard } from "@/actions/boards-action";
import { showActivityToast } from "@/lib/show-activity-toast";
import { Loader2, RotateCcw } from "lucide-react";
import { useTransition } from "react";
import {toast} from "sonner"

interface RestoreBoardButtonProps {
  boardId: string;
  orgId: string;
}

export default function RestoreBoardButton({
  boardId,
  orgId,
}: RestoreBoardButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    startTransition(async () => {
      const result = await restoreBoard(boardId, orgId);
      toast.success("board restored")
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
