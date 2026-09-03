"use client";

import { restoreBoard } from "@/actions/boards-action";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

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
      await restoreBoard(boardId, orgId);
      toast.success("board restored");
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRestore}
      disabled={isPending}
      className="border-gray-200 text-gray-700 hover:bg-gray-50"
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
    </Button>
  );
}
