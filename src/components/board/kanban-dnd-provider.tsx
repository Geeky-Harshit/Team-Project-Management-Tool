"use client";

import { generateKeyBetween, sortByPosition } from "@/lib/lexicographic-position";
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
import { useHydrated } from "@/hooks/useHydrated";
import { useRouter } from "next/navigation";
import { useMemo, useOptimistic, useRef, useState, useTransition } from "react";
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
  const router = useRouter();
  const hydrated = useHydrated();
  const [, startTransition] = useTransition();
  const [activeDragCard, setActiveDragCard] = useState<Card | null>(null);
  const [dragRotation, setDragRotation] = useState(0);
  const lastOverListId = useRef<string | null>(null);
  const preDragCards = useRef<Card[] | null>(null);

  const [optimisticCards, applyOptimistic] = useOptimistic(
    cards,
    (_current: Card[], next: Card[]) => next,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const sortedLists = useMemo(
    () => sortByPosition(initialLists),
    [initialLists],
  );

  const cardsByListId = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const map = new Map<string, Card[]>();

    for (const list of sortedLists) {
      map.set(list.id, []);
    }

    for (const card of optimisticCards) {
      if (selectedAssigneeId && card.assigneeId !== selectedAssigneeId) continue;
      if (
        query &&
        !card.title.toLowerCase().includes(query) &&
        !(card.description && card.description.toLowerCase().includes(query))
      ) {
        continue;
      }
      const bucket = map.get(card.listId);
      if (bucket) bucket.push(card);
      else map.set(card.listId, [card]);
    }

    for (const [listId, listCards] of map) {
      map.set(listId, sortByPosition(listCards));
    }

    return map;
  }, [optimisticCards, sortedLists, selectedAssigneeId, searchQuery]);

  const previewCards = (next: Card[]) => {
    startTransition(() => {
      applyOptimistic(next);
      setCards(next);
    });
  };

  const rollback = (snapshot: Card[] | null, message: string) => {
    if (snapshot) {
      startTransition(() => {
        applyOptimistic(snapshot);
        setCards(snapshot);
      });
    }
    toast.error(message);
    router.refresh();
  };

  const patchCards = (
    body: Record<string, unknown>,
    next: Card[],
    snapshot: Card[] | null,
    errorMessage: string,
  ) => {
    startTransition(async () => {
      applyOptimistic(next);
      try {
        const res = await fetch(`/api/boards/${boardId}/cards`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const detail = await res
            .json()
            .then((data) => data?.error)
            .catch(() => null);
          console.error("Card PATCH failed:", res.status, detail);
          rollback(snapshot, errorMessage);
          return;
        }

        setCards(next);
        showActivityToast("CARD_MOVED");
      } catch (err) {
        console.error("Card PATCH request failed:", err);
        rollback(snapshot, errorMessage);
      }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!canEdit) return;
    const { active } = event;
    const card = optimisticCards.find((c) => c.id === active.id) || null;
    setActiveDragCard(card);
    lastOverListId.current = card?.listId ?? null;
    preDragCards.current = cards;
    setDragRotation((Math.random() - 0.5) * 6);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!canEdit) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeCard = optimisticCards.find((c) => c.id === activeId);
    if (!activeCard) return;

    const isOverAColumn = sortedLists.some((l) => l.id === overId);
    const overCard = optimisticCards.find((c) => c.id === overId);
    const overListId = isOverAColumn ? overId : overCard?.listId;
    if (!overListId || activeCard.listId === overListId) return;
    if (lastOverListId.current === overListId) return;

    lastOverListId.current = overListId;
    previewCards(
      optimisticCards.map((c) =>
        c.id === activeId ? { ...c, listId: overListId } : c,
      ),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    lastOverListId.current = null;
    if (!canEdit) {
      setActiveDragCard(null);
      return;
    }
    const { active, over } = event;
    setActiveDragCard(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const currentCard = optimisticCards.find((c) => c.id === activeId);
    if (!currentCard) return;

    const isOverAColumn = sortedLists.some((l) => l.id === overId);
    const targetListId = isOverAColumn
      ? overId
      : optimisticCards.find((c) => c.id === overId)?.listId;

    if (!targetListId) return;

    const targetListCards = sortByPosition(
      optimisticCards.filter(
        (c) => c.listId === targetListId && c.id !== activeId,
      ),
    );

    let newIndex = targetListCards.length;
    if (!isOverAColumn) {
      const overIndex = targetListCards.findIndex((c) => c.id === overId);
      if (overIndex !== -1) newIndex = overIndex;
    }

    const prev = targetListCards[newIndex - 1] ?? null;
    const next = targetListCards[newIndex] ?? null;
    const position = generateKeyBetween(
      prev?.position ?? null,
      next?.position ?? null,
    );

    if (currentCard.listId === targetListId && currentCard.position === position) {
      return;
    }

    const movedCard = {
      ...currentCard,
      listId: targetListId,
      position,
    };

    const snapshot = preDragCards.current;
    preDragCards.current = null;

    const nextCards = optimisticCards.map((c) =>
      c.id === activeId ? movedCard : c,
    );

    const didMoveLists = Boolean(
      activeDragCard && activeDragCard.listId !== targetListId,
    );

    patchCards(
      {
        cardId: activeId,
        listId: targetListId,
        position,
      },
      nextCards,
      snapshot,
      didMoveLists ? "Failed to move card" : "Failed to save card order",
    );
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
      <div className="flex h-full min-h-0 flex-1 items-stretch px-1 gap-1.25 overflow-x-auto overflow-y-hidden pb-2 pt-1 font-sans">
        {sortedLists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            cards={cardsByListId.get(list.id) ?? []}
            boardId={boardId}
            onOpenCard={onOpenCard}
            dndEnabled={hydrated && canEdit}
            canEdit={canEdit}
          />
        ))}
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
              onClick={() => {}}
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
