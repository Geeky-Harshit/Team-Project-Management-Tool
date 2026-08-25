import { OrgMembersContext } from "@/context/org-members-context";
import { useContext } from "react";

export function useOrgMembers() {
  const context = useContext(OrgMembersContext);
  if (!context) {
    throw new Error("useOrgMembers must be used within an BoardMemberProvider");
  }
  return context;
}