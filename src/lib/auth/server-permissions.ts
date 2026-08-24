import { getSession } from "./auth";
import { requireRole } from "./permissions";
import { Role } from "@/types";
import { prisma } from "@/lib/prisma";

export async function validateOrgAccess(
  orgId: string,
  minRole: Role,
  preloadedOrg?: { id: string; slug: string; name: string }
) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const org = preloadedOrg ?? await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  const role = await requireRole(session.user.id, org.id, minRole);

  return {
    user: session.user,
    org,
    role,
  };
}
