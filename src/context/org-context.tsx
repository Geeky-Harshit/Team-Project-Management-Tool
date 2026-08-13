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
  initialCurrentOrg = null
}: {
  children: React.ReactNode;
  userId: string;
  initialCurrentOrg?: Organization | null;
}) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
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

  useEffect(() => {
    if (userId) {
      (() => refreshOrgs())();
    }
  }, [userId, refreshOrgs]);

  // Optimize: Use the server-provided org if client list is still loading
  const currentOrg = orgs.find((o) => o.slug === orgSlug) || initialCurrentOrg;

  return (
    <OrgContext.Provider value={{ orgs, currentOrg, loading, error, refreshOrgs }}>
      {children}
    </OrgContext.Provider>
  );
}
