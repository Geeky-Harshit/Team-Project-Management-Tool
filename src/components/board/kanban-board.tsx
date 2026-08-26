"use client";

import { Card, List } from "@/types";
import { useState, useEffect } from "react";
import EmptyBoard from "./empty-board";
import KanbanDndProvider from "./kanban-dnd-provider";
import CardDetailModal from "./card-detail-modal";
import { useOrgs } from "@/hooks/useOrgs";
import { useRouter } from "next/navigation";

interface KanbanBoardProps {
  initialLists: List[];
  initialCards: Card[];
  boardId: string;
  canEdit?: boolean;
  selectedAssigneeId?: string | null;
  searchQuery?: string;
}

export function KanbanBoard({
  initialLists,
  initialCards,
  boardId,
  canEdit = true,
  selectedAssigneeId = null,
  searchQuery = "",
}: KanbanBoardProps) {
  const { currentOrg } = useOrgs();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeCardModal, setActiveCardModal] = useState<Card | null>(null);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {initialLists.length === 0 ? (
        <EmptyBoard
          boardId={boardId}
          orgId={currentOrg?.id || ""}
          canEdit={canEdit}
        />
      ) : (
        <KanbanDndProvider
          initialLists={initialLists}
          cards={cards}
          setCards={setCards}
          boardId={boardId}
          canEdit={canEdit}
          selectedAssigneeId={selectedAssigneeId}
          searchQuery={searchQuery}
          onOpenCard={setActiveCardModal}
        />
      )}

      {activeCardModal && (
        <CardDetailModal
          card={activeCardModal}
          boardId={boardId}
          canEdit={canEdit}
          onClose={() => {
            setActiveCardModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}