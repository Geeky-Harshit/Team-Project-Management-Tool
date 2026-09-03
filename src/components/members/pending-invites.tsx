"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Invite } from "@/types";
import { ScrollFade } from "../scroll-fade";

interface PendingInvitesProps {
  invites: Invite[];
  onRemoveInvite: (token: string) => Promise<void> | void;
  removingInvite?: string | null;
}

export function PendingInvites({
  invites,
  onRemoveInvite,
  removingInvite = null,
}: PendingInvitesProps) {
  if (invites.length === 0) return null;

  return (
    <Card className="border-gray-200 shadow-sm font-sans">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Pending Invitations</CardTitle>
            <CardDescription>Sent invitations awaiting acceptance</CardDescription>
          </div>
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200/50 px-2.5 py-0.5 rounded-full">
            {invites.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollFade
          maxHeight="max-h-56"
          contentClassName="divide-y divide-gray-100 px-4 py-1"
          fadeColor="from-white via-white/80 to-transparent"
        >
          {invites.map((invite) => {
            const isRemoving = removingInvite === invite.id;
            return (
              <div key={invite.id} className="flex items-center justify-between py-3 font-sans gap-3">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-900 truncate">{invite.email}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    Role: {invite.role}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-orange-500 bg-orange-50 font-semibold px-2 py-0.5 rounded border border-orange-200/50">
                    Pending
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isRemoving}
                    onClick={() => onRemoveInvite(invite.id)}
                    className="h-7 text-xs"
                  >
                    {isRemoving ? "Removing..." : "Remove"}
                  </Button>
                </div>
              </div>
            );
          })}
        </ScrollFade>
      </CardContent>
    </Card>
  );
}
