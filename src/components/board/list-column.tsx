"use client";

import { memo, useMemo, useState } from "react";
import { Card, List } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { ScrollFade } from "../scroll-fade";
import { Button } from "../ui/button";
import CardItem from "./card-item";
import ColumnHeader from "./column-header";
import CreateCardModal from "./create-card-modal";

interface ListColumnProps {
  list: List;
  cards: Card[];
  boardId: string;
  onOpenCard: (card: Card) => void;
  dndEnabled: boolean;
  canEdit?: boolean;
}

function ListColumn({
  list,
  cards,
  boardId,
  onOpenCard,
  dndEnabled,
  canEdit = true,
}: ListColumnProps) {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const droppable = useDroppable({
    id: list.id,
    data: { type: "list", listId: list.id },
    disabled: !dndEnabled,
  });

  const sortableIds = useMemo(() => cards.map((c) => c.id), [cards]);

  return (
    <>
      <div
        ref={dndEnabled ? droppable.setNodeRef : undefined}
        className={
          "w-76 shrink-0 rounded-xl border bg-gray-50 p-1.5 flex flex-col h-full max-h-full min-h-0 transition " +
          (dndEnabled && droppable.isOver
            ? "border-primary/60 ring-2 ring-primary/20"
            : "border-gray-200")
        }
      >
        <ColumnHeader
          listId={list.id}
          boardId={boardId}
          initialName={list.name}
          cardsCount={cards.length}
          canEdit={canEdit}
        />

        <ScrollFade
          className="flex-1 min-h-0 h-full flex flex-col mt-2"
          maxHeight="h-full"
          contentClassName="p-1 flex flex-col min-h-24"
          fadeColor="from-gray-50 via-gray-50/80 to-transparent"
        >
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-3 text-center border border-dashed border-gray-300 rounded-xl bg-white/60 my-auto">
              <p className="text-xs font-medium text-gray-500">
                No cards in this list
              </p>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddCardOpen(true)}
                  className="mt-3 text-xs font-semibold gap-1.5 h-8 border-gray-300 bg-white text-gray-700 hover:bg-orange-50 hover:text-primary hover:border-primary/50 shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Card
                </Button>
              )}
            </div>
          ) : dndEnabled ? (
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {cards.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    onClick={() => onOpenCard(card)}
                    dndEnabled
                  />
                ))}
              </div>
            </SortableContext>
          ) : (
            <div className="flex flex-col gap-2">
              {cards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  onClick={() => onOpenCard(card)}
                  dndEnabled={false}
                />
              ))}
            </div>
          )}
        </ScrollFade>
      </div>

      {canEdit && isAddCardOpen && (
        <CreateCardModal
          listId={list.id}
          listName={list.name}
          boardId={boardId}
          onClose={() => setIsAddCardOpen(false)}
        />
      )}
    </>
  );
}

export default memo(ListColumn);
