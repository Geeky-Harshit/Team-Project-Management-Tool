"use client";

import { useState } from "react";
import { renameList, deleteList } from "@/actions/lists-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useOrgs } from "@/hooks/useOrgs";
import { CreateCardModal } from "./create-card-modal";

interface ColumnHeaderProps {
  listId: string;
  boardId: string;
  initialName: string;
  cardsCount: number;
}

export function ColumnHeader({
  listId,
  boardId,
  initialName,
  cardsCount,
}: ColumnHeaderProps) {
  const { currentOrg } = useOrgs();
  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const handleRename = async () => {
    if (!name.trim() || name === initialName || !currentOrg) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      await renameList(listId, boardId, currentOrg.id, name);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this list and all its cards?") || !currentOrg) return;
    setLoading(true);
    try {
      await deleteList(listId, boardId, currentOrg.id);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-1 shrink-0 font-sans">
        {isEditing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="text-sm font-semibold h-8 w-36 focus-visible:ring-primary font-sans"
            disabled={loading}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <span
              onClick={() => setIsEditing(true)}
              className="font-semibold text-gray-700 text-sm cursor-pointer hover:text-black truncate"
              title="Click to rename"
            >
              {name}
            </span>
            <span className="text-xs font-bold text-gray-400 bg-gray-200/50 rounded-full px-2 py-0.5 shrink-0">
              {cardsCount}
            </span>
          </div>
        )}

        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAddCardOpen(true)}
            className="h-7 w-7 text-gray-500 hover:text-primary hover:bg-orange-50"
            title="Add Card"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={loading}
            className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
            title="Delete List"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isAddCardOpen && (
        <CreateCardModal
          listId={listId}
          listName={name}
          boardId={boardId}
          onClose={() => setIsAddCardOpen(false)}
        />
      )}
    </>
  );
}
