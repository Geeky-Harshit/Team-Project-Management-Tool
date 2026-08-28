"use client";

import { memo, useMemo } from "react";
import { Card as ICard } from "@/types";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useOrgMembers } from "@/hooks/useOrgMembers";

interface CardItemProps {
  card: ICard;
  onClick: () => void;
  dndEnabled?: boolean;
  isOverlay?: boolean;
  rotation?: number;
}

function CardItem({
  card,
  onClick,
  dndEnabled = true,
  isOverlay = false,
  rotation = 0,
}: CardItemProps) {
  const members = useOrgMembers();
  const assignee = useMemo(
    () => members.find((m) => m.id === card.assigneeId),
    [members, card.assigneeId]
  );

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

  const style = isOverlay
    ? {
      transform: `rotate(${rotation}deg) scale(1.05)`,
      transition: "transform 150ms ease",
    }
    : dndEnabled
      ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.3 : 1,
      }
      : undefined;

  const assigneeInitials = assignee?.name
    ? assignee.name.slice(0, 2).toUpperCase()
    : card.assigneeId
      ? card.assigneeId.slice(-2).toUpperCase()
      : null;

  return (
    <Card
      ref={dndEnabled ? sortable.setNodeRef : undefined}
      style={style}
      onClick={onClick}
      {...(dndEnabled ? sortable.attributes : {})}
      {...(dndEnabled ? sortable.listeners : {})}
      className={
        "p-3 h-fit min-h-20 bg-white border-gray-200 shadow-xs text-xs font-medium text-gray-800 flex flex-col justify-between gap-2 font-sans select-none " +
        (isOverlay
          ? "cursor-grabbing shadow-xl ring-2 ring-primary/40 border-primary"
          : "cursor-grab active:cursor-grabbing hover:border-primary/60 transition duration-100")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <span className="leading-5 font-semibold text-gray-800">{card.title}</span>
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

          {assigneeInitials && (
            <span
              title={assignee?.name || undefined}
              className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase"
            >
              {assigneeInitials}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

export default memo(CardItem);