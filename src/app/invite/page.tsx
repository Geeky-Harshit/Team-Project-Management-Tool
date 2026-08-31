"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { InviteCard } from "@/components/invite/invite-card";
import { InviteError } from "@/components/invite/invite-error";
import { Loader2 } from "lucide-react";
import { Role } from "@/types";

interface InviteLookupResponse {
  invite: { role: string | null };
  organization: { name: string; slug: string } | null;
}

function InvitePageFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function inviteSignInUrl(token: string) {
  const callbackUrl = `/invite?token=${token}`;
  return `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { data: session, isPending: sessionPending } = useSession();

  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(token ? "" : "No invite token provided.");
  const [inviteData, setInviteData] = useState<InviteLookupResponse | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (sessionPending) {
      return;
    }

    if (!session) {
      router.replace(inviteSignInUrl(token));
      return;
    }

    let cancelled = false;

    fetch("/api/invites/" + token)
      .then(async (res) => {
        if (res.status === 401) {
          router.replace(inviteSignInUrl(token));
          return;
        }

        const data = (await res.json()) as InviteLookupResponse & {
          error?: string;
        };

        if (cancelled) {
          return;
        }

        if (res.status === 403) {
          setError("Access denied");
        } else if (data.error) {
          setError(data.error);
        } else {
          setInviteData(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to fetch invitation details.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, session, sessionPending, router]);

  const handleAccept = async () => {
    if (!session || !token) {
      if (token) {
        router.replace(inviteSignInUrl(token));
      }
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch("/api/invites/" + token + "/accept", {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string; success?: boolean };
      if (res.status === 401) {
        router.replace(inviteSignInUrl(token));
        return;
      }
      if (res.status === 403) {
        setError("Access denied");
      } else if (data.error) {
        setError(data.error);
      } else if (inviteData?.organization) {
        router.push("/" + inviteData.organization.slug);
      }
    } catch {
      setError("Failed to accept invitation.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || sessionPending) {
    return <InvitePageFallback />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      {error ? (
        <InviteError error={error} />
      ) : inviteData ? (
        <InviteCard
          organizationName={inviteData.organization?.name ?? "Unknown"}
          role={(inviteData.invite.role ?? "member") as Role}
          accepting={accepting}
          onAccept={handleAccept}
          isLoggedIn={!!session}
        />
      ) : null}
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<InvitePageFallback />}>
      <InvitePageContent />
    </Suspense>
  );
}
