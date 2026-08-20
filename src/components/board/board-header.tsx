"use client";

import { useState, useMemo } from "react";
import { renameBoard, archiveBoard } from "@/actions/boards-action";
import { createList } from "@/actions/lists-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Archive, Edit2, Plus, Search, X } from "lucide-react";
import { useOrgs } from "@/hooks/useOrgs";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Member {
  id: string;
  name: string;
  image?: string | null;
}

interface BoardHeaderProps {
  boardId: string;
  initialName: string;
  canEdit?: boolean;
  members?: Member[];
  selectedAssigneeId?: string | null;
  onSelectAssignee?: (id: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function BoardHeader({
  boardId,
  initialName,
  canEdit = true,
  members = [],
  selectedAssigneeId = null,
  onSelectAssignee,
  searchQuery = "",
  onSearchChange,
}: BoardHeaderProps) {
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

  // Move clicked/selected member to the top
  const sortedMembers = useMemo(() => {
    if (!selectedAssigneeId) return members;
    return [...members].sort((a, b) => {
      if (a.id === selectedAssigneeId) return -1;
      if (b.id === selectedAssigneeId) return 1;
      return 0;
    });
  }, [members, selectedAssigneeId]);

  const maxVisibleAvatars = 4;
  const visibleMembers = sortedMembers.slice(0, maxVisibleAvatars);
  const overflowMembers = sortedMembers.slice(maxVisibleAvatars);
  const overflowCount = overflowMembers.length;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col gap-4 shrink-0 pb-4 border-b border-gray-200 font-sans">
        {/* Top Row: Board Title & Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {canEdit && isEditing ? (
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
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-gray-600"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {canEdit && (
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
          )}
        </div>

        {/* Bottom Row: Jira-Style Filter Bar (Search + Avatars) */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search board"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9 h-8 text-xs bg-gray-50/50 border-gray-300 focus-visible:ring-primary focus-visible:bg-white"
            />
          </div>

          {/* User Avatars Stack */}
          {sortedMembers.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center -space-x-2">
                {visibleMembers.map((member) => {
                  const isSelected = selectedAssigneeId === member.id;
                  return (
                    <Tooltip key={member.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onSelectAssignee?.(isSelected ? null : member.id)}
                          className={`relative rounded-full transition-all focus:outline-none ${
                            isSelected
                              ? "ring-2 ring-blue-600 ring-offset-2 z-20 scale-105"
                              : "hover:z-10 hover:scale-105"
                          }`}
                        >
                          <Avatar className="h-8 w-8 border-2 border-white shadow-xs">
                            <AvatarImage src={member.image || undefined} alt={member.name} />
                            <AvatarFallback className="text-[11px] bg-blue-100 text-blue-700 font-bold">
                              {member.name ? member.name.slice(0, 2).toUpperCase() : "U"}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {member.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}

                {overflowCount > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[11px] font-medium text-gray-600 shadow-xs transition-transform hover:scale-105 hover:bg-gray-200 focus:outline-none">
                      +{overflowCount}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 p-1">
                      {overflowMembers.map((member) => {
                        const isSelected = selectedAssigneeId === member.id;
                        return (
                          <DropdownMenuItem
                            key={member.id}
                            onClick={() => onSelectAssignee?.(isSelected ? null : member.id)}
                            className={`flex items-center gap-2.5 cursor-pointer rounded-md px-2 py-1.5 text-xs ${
                              isSelected ? "bg-blue-50 font-semibold text-blue-700" : ""
                            }`}
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.image || undefined} alt={member.name} />
                              <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 font-bold">
                                {member.name ? member.name.slice(0, 2).toUpperCase() : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{member.name}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {selectedAssigneeId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectAssignee?.(null)}
                  className="text-xs h-8 px-2 text-gray-500 hover:text-gray-900"
                >
                  Clear filter
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}