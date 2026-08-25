"use client";

import { Columns3 } from "lucide-react";
import { AddList } from "./add-list";

interface EmptyBoardProps {
  boardId: string;
  orgId: string;
  canEdit?: boolean;
}

export function EmptyBoard({
  boardId,
  orgId,
  canEdit = true,
}: EmptyBoardProps) {
  return (
    <div className="flex min-h-[45vh] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-400">
        <Columns3 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">
        No lists in this board
      </h3>
      <p className="mt-1 text-xs text-gray-500 max-w-sm">
        Organize your workflow by creating lists like To Do, In Progress, and Done.
      </p>
      {canEdit && (
        <div className="mt-5">
          <AddList boardId={boardId} orgId={orgId} />
        </div>
      )}
    </div>
  );
}