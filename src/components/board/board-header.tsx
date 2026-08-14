"use client";

import { useState } from "react";
import { renameBoard, archiveBoard } from "@/actions/boards-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Archive, Edit2 } from "lucide-react";
import { useOrgs } from "@/hooks/useOrgs";

interface BoardHeaderProps {
  boardId: string;
  initialName: string;
}

export function BoardHeader({ boardId, initialName }: BoardHeaderProps) {
  const { currentOrg } = useOrgs();
  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!name.trim() || name === initialName || !currentOrg) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      await renameBoard(boardId, currentOrg.id, name);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Archive this board?") || !currentOrg) return;
    setLoading(true);
    try {
      await archiveBoard(boardId, currentOrg.id);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between shrink-0 pb-4 border-b border-gray-200 font-sans">
      <div className="flex items-center gap-3">
        {isEditing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="text-2xl font-bold h-10 w-64 focus-visible:ring-primary font-sans"
            disabled={loading}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleArchive}
        disabled={loading}
        className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold gap-1.5 font-sans"
      >
        <Archive className="h-4 w-4" />
        Archive Board
      </Button>
    </div>
  );
}