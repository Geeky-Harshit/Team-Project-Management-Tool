"use client";

import { useState } from "react";
import { renameBoard, archiveBoard } from "@/actions/boards-action";
import { createList } from "@/actions/lists-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Archive, Edit2, Plus, X } from "lucide-react";
import { useOrgs } from "@/hooks/useOrgs";
import { toast } from "sonner";

interface BoardHeaderProps {
  boardId: string;
  initialName: string;
}

export function BoardHeader({ boardId, initialName }: BoardHeaderProps) {
  const { currentOrg } = useOrgs();
  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add List state
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [listLoading, setListLoading] = useState(false);

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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pb-4 border-b border-gray-200 font-sans">
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

      <div className="flex items-center gap-2">
        {isAddingList ? (
          <form onSubmit={handleCreateList} className="flex items-center gap-1.5">
            <Input
              autoFocus
              placeholder="List name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="h-8 text-xs w-40 bg-white focus-visible:ring-primary"
              disabled={listLoading}
              required
            />
            <Button
              type="submit"
              size="sm"
              disabled={listLoading || !newListName.trim()}
              className="h-8 text-xs px-3 bg-primary hover:bg-primary/90"
            >
              {listLoading ? "Adding..." : "Add"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsAddingList(false)}
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </form>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingList(true)}
            className="text-xs font-semibold gap-1.5 h-8 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            Add List
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleArchive}
          disabled={loading}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold gap-1.5 h-8 font-sans"
        >
          <Archive className="h-3.5 w-3.5" />
          Archive Board
        </Button>
      </div>
    </div>
  );
}
