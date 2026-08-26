"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {member.user.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {member.user.name} {isSelf && "(You)"}
          </span>
          <span className="text-xs text-gray-500 truncate" title={member.user.email}>
            {member.user.email}
          </span>
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
          <AlertDialog>
            <AlertDialogTrigger
              className="inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-400 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Remove Member"
            >
              <Trash2 className="h-4 w-4" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Member</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove &quot;{member.user.name}&quot; from this organization?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(member.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
