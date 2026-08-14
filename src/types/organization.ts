export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type Role = "owner" | "admin" | "member" | "viewer";

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  createdAt: Date;
}

export interface Invite {
  id: string;
  organizationId: string;
  email: string;
  token: string;
  role: Role;
  invitedBy: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface MemberWithUser {
  id: string;
  role: Role;
  createdAt: string;
  user: MemberUser;
}
