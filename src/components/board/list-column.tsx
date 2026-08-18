import { Card, List } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ScrollFade } from "../scroll-fade";
import { Button } from "../ui/button";
import { CardItem } from "./card-item";
import { ColumnHeader } from "./column-header";
import { CreateCardModal } from "./create-card-modal";

interface ListColumnProps {
  list: List;
  cards: Card[];
  boardId: string;
  onOpenCard: (card: Card) => void;
  dndEnabled: boolean;
  canEdit?: boolean;
}

export default function ListColumn({ list, cards, boardId, onOpenCard, dndEnabled, canEdit = true }: ListColumnProps) {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const droppable = useDroppable({
    id: list.id,
    data: { type: "list", listId: list.id },
    disabled: !dndEnabled,
  });

  return (
    <>
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
          canEdit={canEdit}
        />
        <ScrollFade maxHeight="max-h-[55vh]" contentClassName="mt-3 p-1 flex flex-col min-h-24">
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-3 text-center border border-dashed border-gray-300 rounded-xl bg-white/60 my-auto">
              <p className="text-xs font-medium text-gray-500">No cards in this list</p>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddCardOpen(true)}
                  className="mt-3 text-xs font-semibold gap-1.5 h-8 border-gray-300 bg-white text-gray-700 hover:bg-orange-50 hover:text-primary hover:border-primary/50 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Card
                </Button>
              )}
            </div>
          ) : dndEnabled ? (
            <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {cards.map((card) => (
                  <CardItem key={card.id} card={card} onClick={() => onOpenCard(card)} dndEnabled />
                ))}
              </div>
            </SortableContext>
          ) : (
            <div className="flex flex-col gap-2">
              {cards.map((card) => (
                <CardItem key={card.id} card={card} onClick={() => onOpenCard(card)} dndEnabled={false} />
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