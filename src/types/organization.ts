export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export type Role = "admin" | "member" | "viewer";

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
export interface Invite {
  id: string;
  organizationId: string;
  email: string;
  token: string;
  role: Role;
  invitedBy: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
