"use client";

import { createList } from "@/actions/lists-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrgs } from "@/hooks/useOrgs";
import { Card, List } from "@/types";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Columns3, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CardDetailModal } from "./card-detail-modal";
import { CardItem } from "./card-item";
import ListColumn from "./list-column";

interface KanbanBoardProps {
  initialLists: List[];
  initialCards: Card[];
  boardId: string;
  canEdit?: boolean;
}

function sortByPosition(cards: Card[]) {
  return [...cards].sort((a, b) => a.position - b.position);
}

export function KanbanBoard({ initialLists, initialCards, boardId, canEdit = true }: KanbanBoardProps) {
  const router = useRouter();
  const { currentOrg } = useOrgs();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeCardModal, setActiveCardModal] = useState<Card | null>(null);
  const [activeDragCard, setActiveDragCard] = useState<Card | null>(null);
  const [dragRotation, setDragRotation] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  // Empty state list creation
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    (() => setCards(initialCards))();
  }, [initialCards]);

  useEffect(() => {
    (() => setMounted(true))();
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
      // Dragging to the RIGHT
      setDragRotation(3);
    } else if (targetIndex < sourceIndex) {
      // Dragging to the LEFT
      setDragRotation(-3);
    } else {
      // Over starting list -> NO rotation
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
    } catch {
      setCards(backup);
      toast.error("Failed to move card to target list");
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !currentOrg) return;

    setListLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newListName.trim());
      formData.append("boardId", boardId);
      formData.append("orgId", currentOrg.id);

      await createList(formData);
      setNewListName("");
      setIsAddingList(false);
      toast.success("List created successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create list");
    } finally {
      setListLoading(false);
    }
  };

  const boardContent = (
    <div className="flex-1 overflow-x-auto pb-2">
      {initialLists.length === 0 ? (
        <div className="flex min-h-[45vh] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-400">
            <Columns3 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No lists in this board</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-sm">
            Organize your workflow by creating lists like To Do, In Progress, and Done.
          </p>
          {canEdit && (
            isAddingList ? (
              <form onSubmit={handleCreateList} className="mt-5 flex items-center gap-2">
                <Input
                  autoFocus
                  placeholder="Enter list title..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="h-9 text-xs w-48 bg-white focus-visible:ring-primary"
                  disabled={listLoading}
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={listLoading || !newListName.trim()}
                  className="h-9 text-xs px-3.5 bg-primary hover:bg-primary/90"
                >
                  {listLoading ? "Adding..." : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddingList(false)}
                  className="h-9 w-9 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button
                onClick={() => setIsAddingList(true)}
                className="mt-5 bg-primary hover:bg-primary/90 text-xs font-semibold gap-1.5 shadow-sm px-4"
              >
                <Plus className="h-4 w-4" />
                Add First List
              </Button>
            )
          )}
        </div>
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
                onClick={() => { }}
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
