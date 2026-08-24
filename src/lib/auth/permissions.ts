import { prisma } from "@/lib/prisma";
import { Role } from "@/types";
import { cache } from "react";

const roleHierarchy: Record<Role, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

// Retrieves the user's role in a specific organization and cache using react.
export const getUserOrgRole = cache(
  async (userId: string, organizationId: string): Promise<Role | null> => {
    const membership = await prisma.member.findFirst({
      where: { userId, organizationId },
    });
    return membership ? (membership.role as Role) : null;
  },
);

// Checks if a user has at least the minimum role required. Throws an error if they don't.
export async function requireRole(
  userId: string,
  organizationId: string,
  minRole: Role,
) {
  const role = await getUserOrgRole(userId, organizationId);
  if (!role) {
    throw new Error("Not a member of this organization");
  }

  if (roleHierarchy[role] < roleHierarchy[minRole]) {
    throw new Error("Insufficient permissions");
  }

  return role;
}

// Quick capability helper checks
export function canManageOrg(role: Role): boolean {
  return role === "owner" || role === "admin";
}

export function canEditCards(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

export function canViewBoard(role: Role): boolean {
  return (
    role === "owner" ||
    role === "admin" ||
    role === "member" ||
    role === "viewer"
  );
}
