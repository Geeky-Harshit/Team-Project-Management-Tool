"use client";

import { useState } from "react";
import { BoardHeader, Member } from "@/components/board/board-header";
import { KanbanBoard } from "@/components/board/kanban-board";
import { List as IList, Card as ICard } from "@/types";

interface BoardViewProps {
  boardId: string;
  boardName: string;
  canEdit: boolean;
  lists: IList[];
  cards: ICard[];
  members: Member[];
  orgName: string;
  overdueCount: number;
}

export function BoardView({
  boardId,
  boardName,
  canEdit,
  lists,
  cards,
  members,
  orgName,
  overdueCount,
}: BoardViewProps) {
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <BoardHeader
          boardId={boardId}
          initialName={boardName}
          canEdit={canEdit}
          members={members}
          selectedAssigneeId={selectedAssigneeId}
          onSelectAssignee={setSelectedAssigneeId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Lists</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{lists.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Tasks</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{cards.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Overdue</p>
            <p className="mt-1 text-xl font-bold text-red-600">{overdueCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Organization</p>
            <p className="mt-1 truncate text-sm font-semibold text-gray-900">{orgName}</p>
          </div>
        </div>
      </section>

      <section className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <KanbanBoard
          initialLists={lists}
          initialCards={cards}
          boardId={boardId}
          canEdit={canEdit}
          selectedAssigneeId={selectedAssigneeId}
          searchQuery={searchQuery}
        />
      </section>
    </div>
  );
}