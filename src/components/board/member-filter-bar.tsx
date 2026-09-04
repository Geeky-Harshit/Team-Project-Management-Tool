"use client";

import { useMemo } from "react";
import { MemberUser as IMember } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth/auth-client";
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
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Current user first (only present if they have a task on this board), then everyone else.
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (currentUserId) {
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [members, currentUserId]);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        <div className="relative w-48 sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for a task"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9 h-8 text-xs bg-gray-50/50 border-gray-300 focus-visible:ring-primary focus-visible:bg-white"
          />
        </div>

        {sortedMembers.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {sortedMembers.map((member, index) => {
                const isSelf = member.id === currentUserId;
                const isSelected = selectedAssigneeId === member.id;
                const showDivider =
                  isSelf && index === 0 && sortedMembers.length > 1;
                const overlapPrevious =
                  index > 0 &&
                  !(index === 1 && sortedMembers[0]?.id === currentUserId);

                return (
                  <div key={member.id} className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger
                        type="button"
                        onClick={() =>
                          onSelectAssignee?.(isSelected ? null : member.id)
                        }
                        className={`relative rounded-full transition-all focus:outline-none ${
                          overlapPrevious ? "-ml-2" : ""
                        } ${
                          isSelected
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
                        {isSelf ? `${member.name} (You)` : member.name}
                      </TooltipContent>
                    </Tooltip>
                    {showDivider && (
                      <span
                        className="mx-1.5 h-5 w-px shrink-0 bg-gray-300"
                        aria-hidden
                      />
                    )}
                  </div>
                );
              })}
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