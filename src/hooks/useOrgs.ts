import { OrgContext } from "@/context/org-context";
import { useContext } from "react";

export function useOrgs() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrgs must be used within an OrgProvider");
  }
  return context;
}