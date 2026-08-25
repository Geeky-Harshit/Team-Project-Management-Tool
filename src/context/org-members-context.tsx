"use client";

import { createContext } from "react";
import { MemberUser } from "@/types";

export const OrgMembersContext = createContext<MemberUser[]>([]);

export function OrgMembersProvider({
  members,
  children,
}: {
  members: MemberUser[];
  children: React.ReactNode;
}) {
  return (
    <OrgMembersContext.Provider value={members}>
      {children}
    </OrgMembersContext.Provider>
  );
}
