"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { InviteForm } from "./invite-form";
import { MembersList } from "./members-list";
import { PendingInvites } from "./pending-invites";
import { Role, Invite, MemberWithUser } from "@/types";
import { toast } from "sonner";

interface MembersClientProps {
  orgId: string;
  isAdmin: boolean;
  currentUserId: string;
  initialMembers?: MemberWithUser[];
  initialInvites?: Invite[];
}

export default function MembersClient({
  orgId,
  isAdmin,
  currentUserId,
  initialMembers = [],
  initialInvites = [],
}: MembersClientProps) {
  const [members, setMembers] = useState<MemberWithUser[]>(initialMembers);
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
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
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/invites?organizationId=${orgId}`);
      if (res.ok) {
        const data = (await res.json()) as Invite[];
        setInvites(data);
      }
    } catch (err) {
      console.error("Failed to fetch invites", err);
    }
  }, [orgId, isAdmin]);

  // Only run mount fetch if NO initial server data was provided
  useEffect(() => {
    if (!orgId || initialMembers.length > 0) return;
    let isMounted = true;

    async function loadMembersAndInvites() {
      try {
        const membersPromise = authClient.organization.listMembers({
          query: { organizationId: orgId },
        });
        const invitesPromise = isAdmin
          ? fetch(`/api/invites?organizationId=${orgId}`).then((r) => (r.ok ? r.json() : []))
          : Promise.resolve([]);

        const [membersRes, invitesRes] = await Promise.all([membersPromise, invitesPromise]);

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

        if (isAdmin && Array.isArray(invitesRes)) {
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
  }, [orgId, initialMembers.length, isAdmin]);

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId: orgId,
      });
      if (res.error) {
        toast.error(res.error.message || "Failed to remove member");
      } else {
        await fetchMembers();
        toast.success("Member removed successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove member");
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
        toast.error(res.error.message || "Failed to update role");
      } else {
        await fetchMembers();
        toast.success("Role updated successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
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
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto font-sans md:overflow-hidden">
      <div className="flex shrink-0 items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Workspace</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Members</h1>
          <p className="text-sm text-gray-500">Manage collaborators and roles for this workspace</p>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-3">
        <div className={`min-h-0 ${isAdmin ? "md:col-span-2" : "md:col-span-3"}`}>
          <MembersList
            members={members}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            onChangeRole={handleChangeRole}
            onRemove={handleRemoveMember}
          />
        </div>

        {isAdmin && (
          <div className="flex min-h-0 flex-col gap-6 md:overflow-y-auto">
            <InviteForm orgId={orgId} onInviteSuccess={fetchInvites} />
            <PendingInvites
              invites={invites}
              onRemoveInvite={handleRemoveInvite}
              removingInvite={removingInviteToken}
            />
          </div>
        )}
      </div>
    </div>
  );
}
