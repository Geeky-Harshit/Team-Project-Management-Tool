"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Invite } from "@/types";

export function PendingInvites({ invites }: { invites: Invite[] }) {
  if (invites.length === 0) return null;

  return (
    <Card className="border-gray-200 shadow-sm font-sans">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Pending Invitations</CardTitle>
        <CardDescription>Sent invitations that haven&apos;t been accepted yet</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-gray-100">
        {invites.map((invite) => (
          <div key={invite.token || invite.id} className="flex items-center justify-between py-3 font-sans">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{invite.email}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                Role: {invite.role}
              </span>
            </div>
            <span className="text-xs text-orange-500 bg-orange-50 font-semibold px-2 py-0.5 rounded border border-orange-200/50">
              Pending
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}