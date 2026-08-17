"use client";

import { Card as ICard } from "@/types";
import { Card } from "@/components/ui/card";
import { Calendar, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CardItemProps {
  card: ICard;
  onClick: () => void;
  dndEnabled?: boolean;
}

export function CardItem({ card, onClick, dndEnabled = true }: CardItemProps) {
  const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() : false;

  const sortable = useSortable({
    id: card.id,
    data: {
      type: "card",
      cardId: card.id,
      listId: card.listId,
    },
    disabled: !dndEnabled,
  });

  const style = dndEnabled
    ? {
      transform: CSS.Transform.toString(sortable.transform),
      transition: sortable.transition,
      opacity: sortable.isDragging ? 0.45 : 1,
    }
    : undefined;

  return (
    <Card
      ref={dndEnabled ? sortable.setNodeRef : undefined}
      style={style}
      onClick={onClick}
      className="p-3 h-fit min-h-24 bg-white hover:border-primary cursor-pointer border-gray-200 shadow-xs text-xs font-medium text-gray-800 transition duration-100 flex flex-col gap-2 font-sans select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="leading-5">{card.title}</span>
        <button
          type="button"
          aria-label="Drag card"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
          {...(dndEnabled ? sortable.attributes : {})}
          {...(dndEnabled ? sortable.listeners : {})}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      {(card.dueDate || card.assigneeId) && (
        <div className="flex items-center justify-between mt-1">
          {card.dueDate ? (
            <span
              suppressHydrationWarning
              className={
                "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border " +
                (isOverdue
                  ? "text-red-600 bg-red-50 border-red-200"
                  : "text-gray-500 bg-gray-50 border-gray-200")
              }
            >
              <Calendar className="h-3 w-3" />
              {new Date(card.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          ) : (
            <span />
          )}

          {card.assigneeId && (
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase">
              {card.assigneeId.slice(-4)}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}