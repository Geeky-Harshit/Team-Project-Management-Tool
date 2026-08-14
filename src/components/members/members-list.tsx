"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberWithUser, Role } from "@/types";
import { MemberRow } from "./member-row";

interface MembersListProps {
  members: MemberWithUser[];
  isAdmin: boolean;
  currentUserId: string;
  onChangeRole: (memberId: string, newRole: Role) => void;
  onRemove: (memberId: string) => void;
}

export function MembersList({
  members,
  isAdmin,
  currentUserId,
  onChangeRole,
  onRemove,
}: MembersListProps) {
  return (
    <Card className="border-gray-200 shadow-sm font-sans">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Active Members</CardTitle>
        <CardDescription>Collaborators in this organization</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-gray-100">
        {members.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No active members found.</p>
        ) : (
          members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              onChangeRole={onChangeRole}
              onRemove={onRemove}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}