import connectDB from "@/lib/db";
import OrganizationMember from "@/models/organization/OrganizationMember";

export type Role = "admin" | "member" | "viewer";

const roleHierarchy: Record<Role, number> = {
  admin: 3,
  member: 2,
  viewer: 1,
};


// Retrieves the user's role in a specific organization.
export async function getUserOrgRole(userId: string, organizationId: string): Promise<Role | null> {
  await connectDB();
  const membership = await OrganizationMember.findOne({
    userId,
    organizationId,
  });
  return membership ? (membership.role as Role) : null;
}


// Checks if a user has at least the minimum role required. Throws an error if they don't.
export async function requireRole(userId: string, organizationId: string, minRole: Role) {
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
  return role === "admin";
}

export function canEditCards(role: Role): boolean {
  return role === "admin" || role === "member";
}

export function canViewBoard(role: Role): boolean {
  return role === "admin" || role === "member" || role === "viewer";
}
