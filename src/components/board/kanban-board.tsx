"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ColumnHeader } from "./column-header";
import { CardItem } from "./card-item";
import CreateCardForm from "@/components/create-card-form";
import CreateListForm from "@/components/create-list-form";
import { CardDetailModal } from "./card-detail-modal";
import { List, Card } from "@/types";

interface KanbanBoardProps {
  initialLists: List[];
  initialCards: Card[];
  boardId: string;
}

function sortByPosition(cards: Card[]) {
  return [...cards].sort((a, b) => a.position - b.position);
}

interface ListColumnProps {
  list: List;
  cards: Card[];
  boardId: string;
  onOpenCard: (card: Card) => void;
  dndEnabled: boolean;
}

function ListColumn({ list, cards, boardId, onOpenCard, dndEnabled }: ListColumnProps) {
  const droppable = useDroppable({
    id: list.id,
    data: { type: "list", listId: list.id },
    disabled: !dndEnabled,
  });

  return (
    <div
      ref={dndEnabled ? droppable.setNodeRef : undefined}
      className={
        "w-76 shrink-0 rounded-xl border bg-gray-50 p-3 transition " +
        (dndEnabled && droppable.isOver ? "border-primary/60 ring-2 ring-primary/20" : "border-gray-200")
      }
    >
      <ColumnHeader
        listId={list.id}
        boardId={boardId}
        initialName={list.name}
        cardsCount={cards.length}
      />

      {dndEnabled ? (
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-3 flex max-h-[58vh] min-h-24 flex-col gap-2 overflow-y-auto pr-0.5">
            {cards.map((card) => (
              <CardItem key={card.id} card={card} onClick={() => onOpenCard(card)} dndEnabled />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="mt-3 flex max-h-[58vh] min-h-24 flex-col gap-2 overflow-y-auto pr-0.5">
          {cards.map((card) => (
            <CardItem key={card.id} card={card} onClick={() => onOpenCard(card)} dndEnabled={false} />
          ))}
        </div>
      )}

      <div className="mt-3">
        <CreateCardForm listId={list.id} boardId={boardId} />
      </div>
    </div>
  );
}

export function KanbanBoard({ initialLists, initialCards, boardId }: KanbanBoardProps) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeCardModal, setActiveCardModal] = useState<Card | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    (()=>setMounted(true))();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const cardsByList = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const list of initialLists) map.set(list.id, []);
    for (const card of cards) {
      const arr = map.get(card.listId);
      if (arr) arr.push(card);
    }
    for (const [key, arr] of map) {
      map.set(key, sortByPosition(arr));
    }
    return map;
  }, [cards, initialLists]);

  const openCard = (card: Card) => setActiveCardModal(card);

  const patchListOrder = async (listId: string, orderedCardIds: string[]) => {
    const res = await fetch("/api/boards/" + boardId + "/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId, cardIds: orderedCardIds }),
    });
    if (!res.ok) throw new Error("Failed to persist list order");
  };

  const patchCardListChange = async (cardId: string, targetListId: string) => {
    const res = await fetch("/api/boards/" + boardId + "/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, listId: targetListId }),
    });
    if (!res.ok) throw new Error("Failed to move card across lists");
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const activeData = active.data.current as { type?: string; cardId?: string; listId?: string } | undefined;
    const overData = over.data.current as { type?: string; cardId?: string; listId?: string } | undefined;

    if (!activeData || activeData.type !== "card" || !activeData.cardId || !activeData.listId) return;

    const sourceListId = activeData.listId;
    const activeCardId = activeData.cardId;
    const targetListId =
      overData?.type === "card"
        ? overData.listId
        : overData?.type === "list"
          ? overData.listId
          : null;

    if (!targetListId) return;

    const sourceCards = sortByPosition(cards.filter((c) => c.listId === sourceListId));
    const targetCards = sortByPosition(cards.filter((c) => c.listId === targetListId));
    const sourceIndex = sourceCards.findIndex((c) => c.id === activeCardId);
    if (sourceIndex === -1) return;

    let targetIndex = targetCards.length;
    if (overData?.type === "card" && overData.cardId) {
      const idx = targetCards.findIndex((c) => c.id === overData.cardId);
      if (idx >= 0) targetIndex = idx;
    }

    const backup = [...cards];

    if (sourceListId === targetListId) {
      const reordered = [...sourceCards];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);

      const reorderedWithPosition = reordered.map((c, idx) => ({ ...c, position: (idx + 1) * 1000 }));
      const nextCards = cards.map((c) =>
        c.listId !== sourceListId ? c : reorderedWithPosition.find((x) => x.id === c.id) || c,
      );

      setCards(nextCards);

      try {
        await patchListOrder(sourceListId, reorderedWithPosition.map((c) => c.id));
      } catch {
        setCards(backup);
      }
      return;
    }

    const sourceClone = [...sourceCards];
    const [movedCard] = sourceClone.splice(sourceIndex, 1);
    const movedToTarget = { ...movedCard, listId: targetListId };

    const targetClone = [...targetCards];
    targetClone.splice(targetIndex, 0, movedToTarget);

    const sourceWithPosition = sourceClone.map((c, idx) => ({ ...c, position: (idx + 1) * 1000 }));
    const targetWithPosition = targetClone.map((c, idx) => ({ ...c, position: (idx + 1) * 1000 }));

    const nextCards = cards.map((c) => {
      if (c.id === movedCard.id) return targetWithPosition.find((x) => x.id === c.id) || c;
      if (c.listId === sourceListId) return sourceWithPosition.find((x) => x.id === c.id) || c;
      if (c.listId === targetListId) return targetWithPosition.find((x) => x.id === c.id) || c;
      return c;
    });

    setCards(nextCards);

    try {
      await patchCardListChange(activeCardId, targetListId);
      await patchListOrder(targetListId, targetWithPosition.map((c) => c.id));
      await patchListOrder(sourceListId, sourceWithPosition.map((c) => c.id));
    } catch {
      setCards(backup);
    }
  };

  const boardContent = (
    <div className="flex-1 overflow-x-auto pb-2">
      <div className="flex h-full min-h-135
       items-start gap-4">
        {initialLists.map((list) => {
          const listCards = cardsByList.get(list.id) || [];
          return (
            <ListColumn
              key={list.id}
              list={list}
              cards={listCards}
              boardId={boardId}
              onOpenCard={openCard}
              dndEnabled={mounted}
            />
          );
        })}
        <div className="w-76 shrink-0">
          <CreateListForm boardId={boardId} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {mounted ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {boardContent}
        </DndContext>
      ) : (
        boardContent
      )}

      {activeCardModal && (
        <CardDetailModal
          card={activeCardModal}
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