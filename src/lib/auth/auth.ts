import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins/organization";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc,
} from "better-auth/plugins/organization/access";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

const statements = {
  ...defaultStatements,
} as const;

const ac = createAccessControl(statements);
const viewer = ac.newRole({});

const vercelOrigins = [
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_URL,
]
  .filter(Boolean)
  .map((host) => `https://${host}`);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: vercelOrigins,
  advanced: {
    trustedProxyHeaders: process.env.VERCEL === "1",
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
      ac,
      roles: {
        owner: ownerAc,
        admin: adminAc,
        member: memberAc,
        viewer,
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
  },
});

export const getSession = cache(async () => {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  return result;
});

export async function signOut() {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  if (result.success) {
    redirect("/sign-in");
  }
}
