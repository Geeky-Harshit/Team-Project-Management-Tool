"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { InviteForm } from "./invite-form";
import { MembersList } from "./members-list";
import { PendingInvites } from "./pending-invites";
import { Role, Invite, MemberWithUser } from "@/types";

interface MembersClientProps {
  orgId: string;
  isAdmin: boolean;
  currentUserId: string;
}

export default function MembersClient({
  orgId,
  isAdmin,
  currentUserId,
}: MembersClientProps) {
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [removingInviteToken, setRemovingInviteToken] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await authClient.organization.listMembers({
        query: { organizationId: orgId },
      });
      if (res.data) {
        const typed: MemberWithUser[] = res.data.members.map((m) => ({
          id: m.id,
          role: m.role as Role,
          createdAt: m.createdAt,
          user: {
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            image: m.user.image ?? null,
          },
        }));
        setMembers(typed);
      }
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  }, [orgId]);

  const fetchInvites = useCallback(async () => {
    try {
      const res = await fetch(`/api/invites?organizationId=${orgId}`);
      if (res.ok) {
        const data = (await res.json()) as Invite[];
        setInvites(data);
      }
    } catch (err) {
      console.error("Failed to fetch invites", err);
    }
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    let isMounted = true;

    async function loadMembersAndInvites() {
      try {
        const [membersRes, invitesRes] = await Promise.all([
          authClient.organization.listMembers({ query: { organizationId: orgId } }),
          fetch(`/api/invites?organizationId=${orgId}`).then((r) => (r.ok ? r.json() : [])),
        ]);

        if (!isMounted) return;

        if (membersRes.data?.members) {
          const typed: MemberWithUser[] = membersRes.data.members.map((m) => ({
            id: m.id,
            role: m.role as Role,
            createdAt: m.createdAt,
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
              image: m.user.image ?? null,
            },
          }));
          setMembers(typed);
        }

        if (Array.isArray(invitesRes)) {
          setInvites(invitesRes as Invite[]);
        }
      } catch (err) {
        console.error("Failed to load members or invites", err);
      }
    }

    loadMembersAndInvites();

    return () => {
      isMounted = false;
    };
  }, [orgId]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId: orgId,
      });
      if (res.error) {
        alert(res.error.message || "Failed to remove member");
      } else {
        await fetchMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: Role) => {
    try {
      const res = await authClient.organization.updateMemberRole({
        memberId,
        role: newRole,
        organizationId: orgId,
      });
      if (res.error) {
        alert(res.error.message || "Failed to update role");
      } else {
        await fetchMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveInvite = async (token: string) => {
    setRemovingInviteToken(token);
    try {
      const res = await fetch("/api/invites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, token }),
      });

      const data = (await res.json()) as { error?: string; success?: boolean };
      if (data.error) {
        console.error(data.error);
        return;
      }

      await fetchInvites();
    } catch (err) {
      console.error("Failed to remove invite", err);
    } finally {
      setRemovingInviteToken(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <p className="text-sm text-gray-500">Manage who has access to this workspace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 flex flex-col gap-6">
          <MembersList
            members={members}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            onChangeRole={handleChangeRole}
            onRemove={handleRemoveMember}
          />
          <PendingInvites
            invites={invites}
            onRemoveInvite={handleRemoveInvite}
            removingInvite={removingInviteToken}
          />
        </div>

        {isAdmin && (
          <InviteForm orgId={orgId} onInviteSuccess={fetchInvites} />
        )}
      </div>
    </div>
  );
}
