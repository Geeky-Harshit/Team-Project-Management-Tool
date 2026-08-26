"use client";

import { showActivityToast } from "@/lib/show-activity-toast";
import { Card, List } from "@/types";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import CardItem from "./card-item";
import ListColumn from "./list-column";

interface KanbanDndProviderProps {
  initialLists: List[];
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  boardId: string;
  canEdit?: boolean;
  selectedAssigneeId?: string | null;
  searchQuery?: string;
  onOpenCard: (card: Card) => void;
}

const sortByPosition = <T extends { position: number }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.position - b.position);

export default function KanbanDndProvider({
  initialLists,
  cards,
  setCards,
  boardId,
  canEdit = true,
  selectedAssigneeId = null,
  searchQuery = "",
  onOpenCard,
}: KanbanDndProviderProps) {
  const [, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [activeDragCard, setActiveDragCard] = useState<Card | null>(null);
  const [dragRotation, setDragRotation] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const sortedLists = sortByPosition(initialLists);

  const patchListOrder = (listId: string, orderedCards: Card[]) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/boards/${boardId}/cards`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listId,
            cardIds: orderedCards.map((c) => c.id),
          }),
        });

        if (res.ok) {
          showActivityToast("CARD_MOVED");
        } else {
          toast.error("Failed to save card order");
        }
      } catch (err) {
        console.error("Failed to persist card order:", err);
        toast.error("Failed to save card order");
      }
    });
  };

  const patchMoveAcrossLists = (
    cardId: string,
    sourceListId: string,
    targetListId: string,
    sourceCardIds: string[],
    targetCardIds: string[]
  ) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/boards/${boardId}/cards`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardId,
            sourceListId,
            targetListId,
            sourceCardIds,
            targetCardIds,
          }),
        });

        if (res.ok) {
          showActivityToast("CARD_MOVED");
        } else {
          toast.error("Failed to move card");
        }
      } catch (err) {
        console.error("Failed to persist card move across lists:", err);
        toast.error("Failed to move card");
      }
    });
  };


  const handleDragStart = (event: DragStartEvent) => {
    if (!canEdit) return;
    const { active } = event;
    const card = cards.find((c) => c.id === active.id) || null;
    setActiveDragCard(card);
    setDragRotation((Math.random() - 0.5) * 6);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!canEdit) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    const isOverAColumn = sortedLists.some((l) => l.id === overId);
    const overCard = cards.find((c) => c.id === overId);

    if (isOverAColumn) {
      if (activeCard.listId === overId) return;
      setCards((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, listId: overId } : c))
      );
      return;
    }

    if (overCard && activeCard.listId !== overCard.listId) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, listId: overCard.listId } : c
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canEdit) {
      setActiveDragCard(null);
      return;
    }
    const { active, over } = event;
    setActiveDragCard(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const currentCard = cards.find((c) => c.id === activeId);
    if (!currentCard) return;

    const isOverAColumn = sortedLists.some((l) => l.id === overId);
    const targetListId = isOverAColumn
      ? overId
      : cards.find((c) => c.id === overId)?.listId;

    if (!targetListId) return;

    const targetListCards = cards.filter(
      (c) => c.listId === targetListId && c.id !== activeId
    );

    let newIndex = targetListCards.length;
    if (!isOverAColumn) {
      const overIndex = targetListCards.findIndex((c) => c.id === overId);
      if (overIndex !== -1) newIndex = overIndex;
    }

    const reorderedTarget = [...targetListCards];
    reorderedTarget.splice(newIndex, 0, currentCard);

    const reorderedWithPositions = reorderedTarget.map((c, i) => ({
      ...c,
      listId: targetListId,
      position: (i + 1) * 1000,
    }));

    setCards((prev) => {
      const unaffected = prev.filter(
        (c) => c.listId !== targetListId && c.id !== activeId
      );
      return [...unaffected, ...reorderedWithPositions];
    });

    if (activeDragCard && activeDragCard.listId !== targetListId) {
      const sourceListCards = cards
        .filter((c) => c.listId === activeDragCard.listId && c.id !== activeId)
        .sort((a, b) => a.position - b.position);

      patchMoveAcrossLists(
        activeId,
        activeDragCard.listId,
        targetListId,
        sourceListCards.map((c) => c.id),
        reorderedWithPositions.map((c) => c.id)
      );
    } else {
      patchListOrder(targetListId, reorderedWithPositions);
    }
  };

  return (
    <DndContext
      id="kanban-dnd-context"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 items-start gap-4 overflow-x-auto pb-4 pt-1 font-sans">
        {sortedLists.map((list) => {
          let listCards = sortByPosition(
            cards.filter((c) => c.listId === list.id)
          );

          if (selectedAssigneeId) {
            listCards = listCards.filter(
              (c) => c.assigneeId === selectedAssigneeId
            );
          }

          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            listCards = listCards.filter(
              (c) =>
                c.title.toLowerCase().includes(query) ||
                (c.description && c.description.toLowerCase().includes(query))
            );
          }

          return (
            <ListColumn
              key={list.id}
              list={list}
              cards={listCards}
              boardId={boardId}
              onOpenCard={onOpenCard}
              dndEnabled={mounted && canEdit}
              canEdit={canEdit}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragCard ? (
          <div
            style={{
              transform: `rotate(${dragRotation}deg)`,
              transformOrigin: "center",
            }}
            className="w-72 shadow-2xl opacity-90 cursor-grabbing"
          >
            <CardItem
              card={activeDragCard}
              onClick={() => { }}
              dndEnabled={false}
              isOverlay
              rotation={dragRotation}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
