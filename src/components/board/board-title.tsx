"use client";

import { useState } from "react";
import { renameBoard } from "@/actions/boards-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import { showActivityToast } from "@/lib/show-activity-toast";
import { toast } from "sonner";

interface BoardTitleProps {
  boardId: string;
  initialName: string;
  orgId: string;
  canEdit?: boolean;
}

export function BoardTitle({
  boardId,
  initialName,
  orgId,
  canEdit = true,
}: BoardTitleProps) {
  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!name.trim() || name === initialName || !orgId) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      const result = await renameBoard(boardId, orgId, name);
      if (result.success) {
        showActivityToast("BOARD_RENAMED");
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to rename board");
    } finally {
      setLoading(false);
    }
  };

  if (canEdit && isEditing) {
    return (
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleRename}
        onKeyDown={(e) => e.key === "Enter" && handleRename()}
        className="text-2xl font-bold h-10 w-64 focus-visible:ring-primary font-sans"
        disabled={loading}
        autoFocus
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-gray-600"
          onClick={() => setIsEditing(true)}
          title="Rename board"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}