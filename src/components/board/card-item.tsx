"use client";

import { Card as ICard } from "@/types";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface CardItemProps {
  card: ICard;
  onClick: () => void;
}

export function CardItem({ card, onClick }: CardItemProps) {
  const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() : false;

  return (
    <Card
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", card.id)}
      onClick={onClick}
      className="p-3 bg-white hover:border-primary cursor-pointer border-gray-200 shadow-xs text-xs font-medium text-gray-800 transition duration-100 flex flex-col gap-2 font-sans select-none"
    >
      <span>{card.title}</span>

      {(card.dueDate || card.assigneeId) && (
        <div className="flex items-center justify-between mt-1">
          {card.dueDate ? (
            <span
              suppressHydrationWarning={true} /* 👈 Add this prop */
              className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${isOverdue
                  ? "text-red-600 bg-red-50 border-red-200"
                  : "text-gray-500 bg-gray-50 border-gray-200"
                }`}
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