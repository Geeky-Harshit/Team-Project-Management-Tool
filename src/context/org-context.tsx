"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Organization } from "@/types";

interface OrgContextValue {
  orgs: Organization[];
  loading: boolean;
  error: string;
  refreshOrgs: () => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      (()=>refreshOrgs())();
    }
  }, [userId, refreshOrgs]);

  return (
    <OrgContext.Provider value={{ orgs, loading, error, refreshOrgs }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrgs() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrgs must be used within an OrgProvider");
  }
  return context;
}
