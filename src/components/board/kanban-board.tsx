"use client";

import { useOrgs } from "@/hooks/useOrgs";
import { Card, List } from "@/types";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CardDetailModal from "./card-detail-modal";
import CardItem from "./card-item";
import EmptyBoard from "./empty-board";
import ListColumn from "./list-column";

interface KanbanBoardProps {
  initialLists: List[];
  initialCards: Card[];
  boardId: string;
  canEdit?: boolean;
  selectedAssigneeId?: string | null;
  searchQuery?: string;
}

function sortByPosition(cards: Card[]) {
  return [...cards].sort((a, b) => a.position - b.position);
}

export function KanbanBoard({
  initialLists,
  initialCards,
  boardId,
  canEdit = true,
  selectedAssigneeId = null,
  searchQuery = "",
}: KanbanBoardProps) {
  const router = useRouter();
  const { currentOrg } = useOrgs();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeCardModal, setActiveCardModal] = useState<Card | null>(null);
  const [activeDragCard, setActiveDragCard] = useState<Card | null>(null);
  const [dragRotation, setDragRotation] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // Filter cards by selected assignee AND search query before grouping into columns
  const cardsByList = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const list of initialLists) map.set(list.id, []);

    const filteredCards = cards.filter((card) => {
      const matchesAssignee = selectedAssigneeId
        ? card.assigneeId === selectedAssigneeId
        : true;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = query
        ? card.title.toLowerCase().includes(query) ||
          card.description?.toLowerCase().includes(query)
        : true;

      return matchesAssignee && matchesSearch;
    });

    for (const card of filteredCards) {
      const arr = map.get(card.listId);
      if (arr) arr.push(card);
    }
    for (const [key, arr] of map) {
      map.set(key, sortByPosition(arr));
    }
    return map;
  }, [cards, initialLists, selectedAssigneeId, searchQuery]);

  const openCard = (card: Card) => setActiveCardModal(card);

  const patchListOrder = async (listId: string, orderedCardIds: string[]) => {
    const res = await fetch("/api/boards/" + boardId + "/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId, cardIds: orderedCardIds }),
    });
    if (!res.ok) throw new Error("Failed to persist list order");
  };

  const patchMoveAcrossLists = async (payload: {
    cardId: string;
    targetListId: string;
    targetCardIds: string[];
    sourceListId: string;
    sourceCardIds: string[];
  }) => {
    const res = await fetch("/api/boards/" + boardId + "/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to move card across lists");
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDragRotation(0);
    const activeData = active.data.current as { cardId?: string } | undefined;
    if (activeData?.cardId) {
      const found = cards.find((c) => c.id === activeData.cardId);
      if (found) setActiveDragCard(found);
    }
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) {
      setDragRotation(0);
      return;
    }

    const activeData = active.data.current as { listId?: string } | undefined;
    const overData = over.data.current as { type?: string; listId?: string } | undefined;

    const sourceListId = activeData?.listId;
    const targetListId = overData?.listId;

    if (!sourceListId || !targetListId) return;

    const sourceIndex = initialLists.findIndex((l) => l.id === sourceListId);
    const targetIndex = initialLists.findIndex((l) => l.id === targetListId);

    if (targetIndex > sourceIndex) {
      setDragRotation(3);
    } else if (targetIndex < sourceIndex) {
      setDragRotation(-3);
    } else {
      setDragRotation(0);
    }
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveDragCard(null);
    setDragRotation(0);
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

    // Reordering within the SAME list
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
        toast.error("Failed to reorder cards");
      }
      return;
    }

    // Moving ACROSS lists
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
      await patchMoveAcrossLists({
        cardId: activeCardId,
        targetListId,
        targetCardIds: targetWithPosition.map((c) => c.id),
        sourceListId,
        sourceCardIds: sourceWithPosition.map((c) => c.id),
      });
      toast.success("Card moved successfully");
    } catch {
      setCards(backup);
      toast.error("Failed to move card to target list");
    }
  };

  const boardContent = (
    <div className="flex-1 overflow-x-auto pb-2">
      {initialLists.length === 0 ? (
        <EmptyBoard 
          boardId={boardId}
          orgId={currentOrg!.id}
          canEdit={canEdit}
        />
      ) : (
        <div className="flex h-full min-h-135 items-start gap-4">
          {initialLists.map((list) => {
            const listCards = cardsByList.get(list.id) || [];
            return (
              <ListColumn
                key={list.id}
                list={list}
                cards={listCards}
                boardId={boardId}
                onOpenCard={openCard}
                dndEnabled={mounted && canEdit}
                canEdit={canEdit}
              />
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {mounted && initialLists.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {boardContent}
          <DragOverlay dropAnimation={null}>
            {activeDragCard ? (
              <CardItem
                card={activeDragCard}
                onClick={() => {}}
                dndEnabled={false}
                isOverlay
                rotation={dragRotation}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        boardContent
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