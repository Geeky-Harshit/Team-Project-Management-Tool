"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MemberWithUser, Role } from "@/types";
import { Trash2 } from "lucide-react";

interface MemberRowProps {
  member: MemberWithUser;
  isAdmin: boolean;
  currentUserId: string;
  onChangeRole: (memberId: string, newRole: Role) => void;
  onRemove: (memberId: string) => void;
}

export function MemberRow({
  member,
  isAdmin,
  currentUserId,
  onChangeRole,
  onRemove,
}: MemberRowProps) {
  const isSelf = member.user.id === currentUserId;
  const isOwner = member.role === "owner";

  return (
    <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 font-sans">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {member.user.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {member.user.name} {isSelf && "(You)"}
          </span>
          <span className="text-xs text-gray-500">{member.user.email}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isAdmin && !isSelf && !isOwner ? (
          <select
            value={member.role}
            onChange={(e) => onChangeRole(member.id, e.target.value as Role)}
            className="text-xs border border-gray-200 rounded-md p-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        ) : (
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded font-sans">
            {member.role}
          </span>
        )}

        {isAdmin && !isSelf && !isOwner && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(member.id)}
            className="h-8 w-8 text-gray-400 hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}