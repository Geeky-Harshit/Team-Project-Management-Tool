"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Organization } from "@/types";

interface OrgContextValue {
  orgs: Organization[];
  currentOrg: Organization | null;
  loading: boolean;
  error: string;
  refreshOrgs: () => Promise<void>;
}

export const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({
  children,
  userId,
  initialOrgs = [],
  initialCurrentOrg = null,
}: {
  children: React.ReactNode;
  userId: string;
  initialOrgs?: Organization[];
  initialCurrentOrg?: Organization | null;
}) {
  const [orgs, setOrgs] = useState<Organization[]>(initialOrgs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const params = useParams();
  const orgSlug = params?.orgSlug as string | undefined;

  const refreshOrgs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authClient.organization.list();
      if (response?.data) {
        setOrgs(response.data as Organization[]);
      }
    } catch (err) {
      console.error("Failed to load organizations", err);
      setError("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch client-side if NO initial data was provided by the server
  useEffect(() => {
    if (!userId || initialOrgs.length > 0) return;

    let isMounted = true;

    async function loadOrgs() {
      setLoading(true);
      try {
        const response = await authClient.organization.list();
        if (isMounted && response?.data) {
          setOrgs(response.data as Organization[]);
        }
      } catch (err) {
        console.error("Failed to load organizations", err);
        if (isMounted) setError("Failed to load organizations");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrgs();

    return () => {
      isMounted = false;
    };
  }, [userId, initialOrgs.length]);

  const currentOrg = orgs.find((o) => o.slug === orgSlug) || initialCurrentOrg;

  return (
    <OrgContext.Provider value={{ orgs, currentOrg, loading, error, refreshOrgs }}>
      {children}
    </OrgContext.Provider>
  );
}
