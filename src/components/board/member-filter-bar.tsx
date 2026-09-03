"use client";

import { useMemo } from "react";
import { MemberUser as IMember } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search } from "lucide-react";

interface MemberFilterBarProps {
  members: IMember[];
  selectedAssigneeId?: string | null;
  onSelectAssignee?: (id: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function MemberFilterBar({
  members = [],
  selectedAssigneeId = null,
  onSelectAssignee,
  searchQuery = "",
  onSearchChange,
}: MemberFilterBarProps) {
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
      <div className="flex items-center gap-3">
        <div className="relative w-48 sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search board"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9 h-8 text-xs bg-gray-50/50 border-gray-300 focus-visible:ring-primary focus-visible:bg-white"
          />
        </div>

        {sortedMembers.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center -space-x-2">
              {visibleMembers.map((member) => {
                const isSelected = selectedAssigneeId === member.id;
                return (
                  <Tooltip key={member.id}>
                    <TooltipTrigger
                      type="button"
                      onClick={() =>
                        onSelectAssignee?.(isSelected ? null : member.id)
                      }
                      className={`relative rounded-full transition-all focus:outline-none ${isSelected
                          ? "z-20 scale-105 ring-2 ring-primary ring-offset-2"
                          : "hover:z-10 hover:scale-105"
                        }`}
                    >
                      <Avatar className="h-8 w-8 border-2 border-white shadow-xs">
                        <AvatarImage
                          src={member.image || undefined}
                          alt={member.name}
                        />
                        <AvatarFallback className="bg-primary/15 text-[11px] font-bold text-primary">
                          {member.name
                            ? member.name.slice(0, 2).toUpperCase()
                            : "U"}
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
                  <DropdownMenuTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[11px] font-medium text-gray-600 shadow-xs hover:scale-105 hover:bg-gray-200 focus:outline-none">
                    +{overflowCount}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 p-1">
                    {overflowMembers.map((member) => (
                      <DropdownMenuItem
                        key={member.id}
                        onClick={() =>
                          onSelectAssignee?.(
                            selectedAssigneeId === member.id ? null : member.id
                          )
                        }
                        className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-xs ${selectedAssigneeId === member.id
                            ? "bg-primary/10 font-semibold text-primary"
                            : ""
                          }`}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={member.image || undefined}
                            alt={member.name}
                          />
                          <AvatarFallback className="bg-primary/15 text-[10px] font-bold text-primary">
                            {member.name
                              ? member.name.slice(0, 2).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{member.name}</span>
                      </DropdownMenuItem>
                    ))}
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
    </TooltipProvider>
  );
}