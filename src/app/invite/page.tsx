"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { InviteCard } from "@/components/invite/invite-card";
import { InviteError } from "@/components/invite/invite-error";
import { Loader2 } from "lucide-react";
import { Invite, Role } from "@/types";

interface InviteLookupResponse {
  invite: Invite;
  organization: { name: string; slug: string } | null;
  error?: string;
}

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { data: session, isPending: sessionPending } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteData, setInviteData] = useState<InviteLookupResponse | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      (() => {
        setError("No invite token provided.")
        setLoading(false);
      })();
      return;
    }

    fetch(`/api/invites/${token}`)
      .then((res) => res.json())
      .then((data: InviteLookupResponse & { error?: string }) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInviteData(data);
        }
      })
      .catch(() => setError("Failed to fetch invitation details."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!session) {
      router.push(`/sign-in?callbackUrl=/invite?token=${token}`);
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
      const data = (await res.json()) as { error?: string; success?: boolean };
      if (data.error) {
        setError(data.error);
      } else if (inviteData?.organization) {
        router.push(`/${inviteData.organization.slug}`);
      }
    } catch {
      setError("Failed to accept invitation.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || sessionPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      {error ? (
        <InviteError error={error} />
      ) : inviteData ? (
        <InviteCard
          organizationName={inviteData.organization?.name ?? "Unknown"}
          role={inviteData.invite.role as Role}
          accepting={accepting}
          onAccept={handleAccept}
          isLoggedIn={!!session}
        />
      ) : null}
    </div>
  );
}