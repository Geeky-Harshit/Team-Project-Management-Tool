"use client";

import { archiveBoard } from "@/actions/boards-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { useOrgs } from "@/hooks/useOrgs";
import { showActivityToast } from "@/lib/show-activity-toast";
import { MemberUser as IMember } from "@/types";
import { Archive, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AddList } from "./add-list";
import { BoardTitle } from "./board-title";

interface BoardHeaderProps {
  boardId: string;
  initialName: string;
  canEdit?: boolean;
  isAdmin?: boolean;
  members?: IMember[];
  selectedAssigneeId?: string | null;
  onSelectAssignee?: (id: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function BoardHeader({
  boardId,
  initialName,
  canEdit = true,
  isAdmin = false,
  members = [],
  selectedAssigneeId = null,
  onSelectAssignee,
  searchQuery = "",
  onSearchChange,
}: BoardHeaderProps) {
  const { currentOrg } = useOrgs();
  const [loading, setLoading] = useState(false);

  const router = useRouter()

  const handleArchive = async () => {
    if (!confirm("Archive this board?") || !currentOrg) return;

    setLoading(true);

    try {
      await archiveBoard(boardId, currentOrg.id);
      showActivityToast("BOARD_ARCHIVED");
      router.replace(`/${currentOrg.slug}/boards`)
    } catch (err) {
      console.error("Archive failed:", err);
      toast.error("Failed to archive board");
    } finally {
      setLoading(false);
    }
  };

  // Reorder clicked/selected member to the top position
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
    <TooltipProvider>
      <div className="flex flex-col gap-4 shrink-0 pb-4 border-b border-gray-200 font-sans">
        {/* Top Row: Board Title & Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          <BoardTitle
            boardId={boardId}
            initialName={initialName}
            orgId={currentOrg?.id || ""}
            canEdit={canEdit}
          />

          {canEdit && (
            <div className="flex items-center gap-2">
              <AddList boardId={boardId} orgId={currentOrg?.id || ""} />
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleArchive}
                  disabled={loading}
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold gap-1.5 h-8"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive Board
                </Button>
              )}
            </div>
          )}
        </div >
        {/* Bottom Row: Search + Avatars */}
        < div className="flex items-center gap-3" >
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search board"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9 h-8 text-xs bg-gray-50/50 border-gray-300 focus-visible:ring-primary focus-visible:bg-white"
            />
          </div>

          {
            sortedMembers.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex items-center -space-x-2">
                  {visibleMembers.map((member) => {
                    const isSelected = selectedAssigneeId === member.id;
                    return (
                      <Tooltip key={member.id}>
                        <TooltipTrigger
                          type="button"
                          onClick={() => onSelectAssignee?.(isSelected ? null : member.id)}
                          className={`relative rounded-full transition-all focus:outline-none ${isSelected
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
                              className={`flex items-center gap-2.5 cursor-pointer rounded-md px-2 py-1.5 text-xs ${isSelected ? "bg-blue-50 font-semibold text-blue-700" : ""
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
            )
          }
        </div >
      </div >
    </TooltipProvider >
  );
}