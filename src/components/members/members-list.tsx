"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberWithUser, Role } from "@/types";
import { MemberRow } from "./member-row";
import { ScrollFade } from "../scroll-fade";

interface MembersListProps {
  members: MemberWithUser[];
  isAdmin: boolean;
  currentUserId: string;
  onChangeRole: (memberId: string, newRole: Role) => void;
  onRemove: (memberId: string) => void;
}

const ROLE_RANK: Record<string, number> = {
  owner: 1,
  admin: 2,
  member: 3,
  viewer: 4,
};

export function MembersList({
  members,
  isAdmin,
  currentUserId,
  onChangeRole,
  onRemove,
}: MembersListProps) {
  // Sort: 1. Current user -> 2. Owner -> 3. Admin -> 4. Member -> 5. Viewer -> 6. Alphabetical
  const sortedMembers = [...members].sort((a, b) => {
    // 1. Current user always comes first
    if (a.user.id === currentUserId) return -1;
    if (b.user.id === currentUserId) return 1;

    // 2. Role hierarchy
    const rankA = ROLE_RANK[a.role] ?? 99;
    const rankB = ROLE_RANK[b.role] ?? 99;
    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // 3. Alphabetical by name within the same role tier
    return a.user.name.localeCompare(b.user.name);
  });

  return (
    <Card className="border-gray-200 shadow-sm font-sans">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Active Members</CardTitle>
            <CardDescription>Collaborators in this organization</CardDescription>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-gray-100">
        <ScrollFade
          maxHeight="max-h-[calc(100vh-17rem)]"
          contentClassName="space-y-1 px-4 py-3"
          fadeColor="from-white via-white/80 to-transparent"
        >
          {sortedMembers.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No active members found.</p>
          ) : (
            sortedMembers.map((member) => (
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
        </ScrollFade>
      </CardContent>
    </Card>
  );
}
