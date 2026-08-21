export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export type Role = "owner" | "admin" | "member" | "viewer";

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  createdAt: Date | string;
}

export interface Invite {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  invitedBy?: string;
  status?: string;
  expiresAt: Date | string;
  createdAt: Date | string;
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
  createdAt: Date | string;
  user: MemberUser;
}
