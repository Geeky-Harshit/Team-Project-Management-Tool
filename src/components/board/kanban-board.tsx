"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnHeader } from "./column-header";
import { CardItem } from "./card-item";
import CreateCardForm from "@/components/create-card-form";
import CreateListForm from "@/components/create-list-form";
import { CardDetailModal } from "./card-detail-modal";
import { List, Card, Comment } from "@/types";

interface KanbanBoardProps {
  initialLists: List[];
  initialCards: Card[];
  boardId: string;
}

export function KanbanBoard({
  initialLists,
  initialCards,
  boardId,
}: KanbanBoardProps) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeCardModal, setActiveCardModal] = useState<Card | null>(null);
  const [modalComments] = useState<Comment[]>([]);

  const handleOpenCard = (card: Card) => {
    setActiveCardModal(card);
  };

  const handleCardDrop = async (cardId: string, targetListId: string) => {
    const backupCards = [...cards];

    const updatedCards = cards.map((c) =>
      c.id === cardId ? { ...c, listId: targetListId } : c
    );
    setCards(updatedCards);

    try {
      const cardsInList = updatedCards
        .filter((c) => c.listId === targetListId)
        .sort((a, b) => a.position - b.position);

      const res = await fetch(`/api/boards/${boardId}/cards`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardIds: cardsInList.map((c) => c.id),
          listId: targetListId,
        }),
      });

      if (!res.ok) throw new Error("Reorder failed");
    } catch (err) {
      console.error(err);
      setCards(backupCards);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto pb-4 flex gap-4 items-start font-sans">
      {initialLists.map((list) => {
        const listCards = cards
          .filter((c) => c.listId === list.id)
          .sort((a, b) => a.position - b.position);

        return (
          <div
            key={list.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const cardId = e.dataTransfer.getData("text/plain");
              handleCardDrop(cardId, list.id);
            }}
            className="w-72 bg-gray-100 rounded-xl p-3 shrink-0 flex flex-col gap-3 max-h-[70vh] border border-gray-200"
          >
            <ColumnHeader
              listId={list.id}
              boardId={boardId}
              initialName={list.name}
              cardsCount={listCards.length}
            />

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5 min-h-25">
              {listCards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  onClick={() => handleOpenCard(card)}
                />
              ))}
            </div>

            <CreateCardForm listId={list.id} boardId={boardId} />
          </div>
        );
      })}

      <CreateListForm boardId={boardId} />

      {activeCardModal && (
        <CardDetailModal
          card={activeCardModal}
          comments={modalComments}
          boardId={boardId}
          onClose={() => {
            setActiveCardModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}