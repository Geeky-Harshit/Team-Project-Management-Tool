"use client";

import { useMemo, useState } from "react";
import BoardHeader from "@/components/board/board-header";
import { KanbanBoard } from "@/components/board/kanban-board";
import { Card as ICard, List as IList, MemberUser as IMember } from "@/types";

interface BoardClientProps {
  boardId: string;
  boardName: string;
  canEdit: boolean;
  isAdmin?: boolean;
  lists: IList[];
  cards: ICard[];
  members: IMember[];
}

export function BoardClient({
  boardId,
  boardName,
  canEdit,
  isAdmin,
  lists,
  cards,
  members,
}: BoardClientProps) {
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const boardMembers = useMemo(() => {
    const assigneeIdsOnThisBoard = new Set(
      cards.map((c) => c.assigneeId).filter(Boolean)
    );
    return members.filter((m) => assigneeIdsOnThisBoard.has(m.id));
  }, [cards, members]);

  return (
    <>
      <BoardHeader
        boardId={boardId}
        initialName={boardName}
        canEdit={canEdit}
        isAdmin={isAdmin}
        members={boardMembers}
        selectedAssigneeId={selectedAssigneeId}
        onSelectAssignee={setSelectedAssigneeId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="mt-2 min-h-0 flex-1 rounded-xl border border-gray-200 bg-white p-5 shadow-xs sm:p-6">
        <KanbanBoard
          initialLists={lists}
          initialCards={cards}
          boardId={boardId}
          canEdit={canEdit}
          selectedAssigneeId={selectedAssigneeId}
          searchQuery={searchQuery}
        />
      </div>
    </>
  );
}