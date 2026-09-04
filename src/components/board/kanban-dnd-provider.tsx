"use client";

import {
  generateKeyBetween,
  sortByPosition,
} from "@/lib/lexicographic-position";
import { showActivityToast } from "@/lib/show-activity-toast";
import { Card, List } from "@/types";
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useHydrated } from "@/hooks/useHydrated";
import { arrayMove } from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
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

function sameListNeighbors<T extends { id: string }>(
  originalList: T[],
  activeId: string,
  overId: string,
): { prev: T | null; next: T | null } | null {
  const oldIndex = originalList.findIndex((card) => card.id === activeId);
  const newIndex = originalList.findIndex((card) => card.id === overId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null;

  const reordered = arrayMove(originalList, oldIndex, newIndex);
  const index = reordered.findIndex((card) => card.id === activeId);
  return {
    prev: reordered[index - 1] ?? null,
    next: reordered[index + 1] ?? null,
  };
}

function crossListInsertIndex(
  overId: string,
  isOverAColumn: boolean,
  siblings: { id: string }[],
  activeTop: number | null,
  overTop: number | null,
  overHeight: number | null,
  lastOverCardId: string | null,
  lastInsertIndex: number | null,
): number {
  if (isOverAColumn) {
    if (
      lastOverCardId &&
      lastInsertIndex != null &&
      siblings.some((card) => card.id === lastOverCardId)
    ) {
      return lastInsertIndex;
    }
    return siblings.length;
  }

  const overIndex = siblings.findIndex((card) => card.id === overId);
  if (overIndex === -1) return siblings.length;

  const isBelow =
    activeTop != null &&
    overTop != null &&
    overHeight != null &&
    activeTop > overTop + overHeight / 2;

  return isBelow ? overIndex + 1 : overIndex;
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
  const lastOverCardId = useRef<string | null>(null);
  const lastInsertIndex = useRef<number | null>(null);
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

  const listIdSet = useMemo(
    () => new Set(sortedLists.map((list) => list.id)),
    [sortedLists],
  );

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const pointerHits = pointerWithin(args);
      const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args);

      const cardHit = hits.find((hit) => !listIdSet.has(String(hit.id)));
      if (cardHit) return [cardHit];

      const listHit = hits.find((hit) => listIdSet.has(String(hit.id)));
      if (listHit) return [listHit];

      return hits;
    },
    [listIdSet],
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

  const resetDropRefs = () => {
    lastOverListId.current = null;
    lastOverCardId.current = null;
    lastInsertIndex.current = null;
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

  const resolveDropTarget = (
    overId: string | null,
    sourceCards: Card[],
  ): { targetListId: string; isOverAColumn: boolean; overId: string } | null => {
    if (overId) {
      const isOverAColumn = listIdSet.has(overId);
      const overCard = sourceCards.find((card) => card.id === overId);
      const targetListId = isOverAColumn ? overId : overCard?.listId;
      if (targetListId) return { targetListId, isOverAColumn, overId };
    }

    if (lastOverListId.current) {
      return {
        targetListId: lastOverListId.current,
        isOverAColumn: true,
        overId: lastOverListId.current,
      };
    }

    return null;
  };

  const visibleInList = (source: Card[], listId: string) => {
    const query = searchQuery.trim().toLowerCase();
    return sortByPosition(
      source.filter((card) => {
        if (card.listId !== listId) return false;
        if (selectedAssigneeId && card.assigneeId !== selectedAssigneeId) {
          return false;
        }
        if (
          query &&
          !card.title.toLowerCase().includes(query) &&
          !(card.description && card.description.toLowerCase().includes(query))
        ) {
          return false;
        }
        return true;
      }),
    );
  };

  const originalList = (listId: string) =>
    visibleInList(preDragCards.current ?? cards, listId);

  const visibleSiblings = (listId: string, activeId: string) =>
    (cardsByListId.get(listId) ?? []).filter((card) => card.id !== activeId);

  const placeCard = (
    sourceCards: Card[],
    activeId: string,
    targetListId: string,
    prev: Card | null,
    next: Card | null,
  ): { nextCards: Card[]; position: string } | null => {
    const currentCard = sourceCards.find((card) => card.id === activeId);
    if (!currentCard) return null;

    const position = generateKeyBetween(
      prev?.position ?? null,
      next?.position ?? null,
    );

    return {
      position,
      nextCards: sourceCards.map((card) =>
        card.id === activeId
          ? { ...card, listId: targetListId, position }
          : card,
      ),
    };
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!canEdit) return;
    const { active } = event;
    const card = cards.find((item) => item.id === active.id) || null;
    setActiveDragCard(card);
    lastOverListId.current = card?.listId ?? null;
    lastOverCardId.current = null;
    lastInsertIndex.current = null;
    preDragCards.current = cards;
    setDragRotation((Math.random() - 0.5) * 6);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!canEdit) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (overId === activeId) return;

    const target = resolveDropTarget(overId, cards);
    if (!target) return;

    if (lastOverListId.current !== target.targetListId) {
      lastOverCardId.current = null;
      lastInsertIndex.current = null;
    }

    if (!target.isOverAColumn) {
      lastOverCardId.current = overId;
    }

    const siblings = visibleSiblings(target.targetListId, activeId);
    const startedInList = originalList(target.targetListId);
    const startedInTarget = startedInList.some((card) => card.id === activeId);
    const overCardId = target.isOverAColumn
      ? lastOverCardId.current
      : overId;

    let prev: Card | null = null;
    let next: Card | null = null;
    let insertIndex: number | null = null;

    if (startedInTarget) {
      if (!overCardId) {
        insertIndex = siblings.length;
        prev = siblings[siblings.length - 1] ?? null;
        next = null;
      } else {
        const neighbors = sameListNeighbors(startedInList, activeId, overCardId);
        if (!neighbors) return;
        prev = neighbors.prev;
        next = neighbors.next;
        insertIndex = startedInList.findIndex((card) => card.id === overCardId);
      }
    } else {
      insertIndex = crossListInsertIndex(
        overId,
        target.isOverAColumn,
        siblings,
        active.rect.current.translated?.top ?? null,
        over.rect.top,
        over.rect.height,
        lastOverCardId.current,
        lastInsertIndex.current,
      );
      prev = siblings[insertIndex - 1] ?? null;
      next = siblings[insertIndex] ?? null;
    }

    if (
      lastOverListId.current === target.targetListId &&
      lastInsertIndex.current === insertIndex
    ) {
      return;
    }

    lastOverListId.current = target.targetListId;
    lastInsertIndex.current = insertIndex;

    const placed = placeCard(
      cards,
      activeId,
      target.targetListId,
      prev,
      next,
    );
    if (!placed) return;

    const currentCard = cards.find((card) => card.id === activeId);
    if (
      currentCard?.listId === target.targetListId &&
      currentCard.position === placed.position
    ) {
      return;
    }

    setCards(placed.nextCards);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canEdit) {
      setActiveDragCard(null);
      resetDropRefs();
      return;
    }

    const { active, over } = event;
    setActiveDragCard(null);

    const activeId = String(active.id);
    const target = resolveDropTarget(over ? String(over.id) : null, cards);
    if (!target) {
      resetDropRefs();
      return;
    }

    const snapshot = preDragCards.current;
    const original = snapshot?.find((card) => card.id === activeId);

    if (target.overId === activeId) {
      resetDropRefs();
      preDragCards.current = null;
      const currentCard = cards.find((card) => card.id === activeId);
      if (
        !currentCard ||
        (original &&
          original.listId === currentCard.listId &&
          original.position === currentCard.position)
      ) {
        return;
      }

      patchCards(
        {
          cardId: activeId,
          listId: currentCard.listId,
          position: currentCard.position,
        },
        cards,
        snapshot,
        original && original.listId !== currentCard.listId
          ? "Failed to move card"
          : "Failed to save card order",
      );
      return;
    }

    const siblings = visibleSiblings(target.targetListId, activeId);
    const startedInList = originalList(target.targetListId);
    const startedInTarget = startedInList.some((card) => card.id === activeId);
    const overCardId = target.isOverAColumn
      ? lastOverCardId.current
      : target.overId;

    let prev: Card | null = null;
    let next: Card | null = null;

    if (startedInTarget) {
      if (!overCardId) {
        prev = siblings[siblings.length - 1] ?? null;
        next = null;
      } else {
        const neighbors = sameListNeighbors(
          startedInList,
          activeId,
          overCardId,
        );
        if (!neighbors) {
          resetDropRefs();
          preDragCards.current = null;
          return;
        }
        prev = neighbors.prev;
        next = neighbors.next;
      }
    } else {
      const insertIndex = crossListInsertIndex(
        target.overId,
        target.isOverAColumn,
        siblings,
        active.rect.current.translated?.top ?? null,
        over?.rect.top ?? null,
        over?.rect.height ?? null,
        lastOverCardId.current,
        lastInsertIndex.current,
      );
      prev = siblings[insertIndex - 1] ?? null;
      next = siblings[insertIndex] ?? null;
    }
    resetDropRefs();
    preDragCards.current = null;

    const placed = placeCard(
      cards,
      activeId,
      target.targetListId,
      prev,
      next,
    );
    if (!placed) return;

    if (
      original &&
      original.listId === target.targetListId &&
      original.position === placed.position
    ) {
      return;
    }

    const didMoveLists = Boolean(
      original && original.listId !== target.targetListId,
    );

    patchCards(
      {
        cardId: activeId,
        listId: target.targetListId,
        position: placed.position,
      },
      placed.nextCards,
      snapshot,
      didMoveLists ? "Failed to move card" : "Failed to save card order",
    );
  };

  return (
    <DndContext
      id="kanban-dnd-context"
      sensors={sensors}
      collisionDetection={collisionDetection}
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
