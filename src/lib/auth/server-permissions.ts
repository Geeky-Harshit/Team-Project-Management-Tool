import { getSession } from "./auth";
import { requireRole } from "./permissions";
import { Role } from "@/types";
import connectDB from "@/lib/db";
import Organization from "@/models/organization/Organization";

export async function validateOrgAccess(orgId: string, minRole: Role) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  console.log(orgId);
  await connectDB();
  const org = await Organization.findOne({ _id:orgId });
  if (!org) {
    throw new Error("Organization not found");
  }

  const role = await requireRole(session.user.id, org._id.toString(), minRole);
  
  return {
    user: session.user,
    org,
    role,
  };
}