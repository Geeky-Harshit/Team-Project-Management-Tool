import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { cache } from "react";

export const getCachedOrgBySlug = cache((slug: string) =>
  unstable_cache(
    async () => {
      return prisma.organization.findUnique({
        where: { slug },
      });
    },
    [`org-slug-${slug}`],
    {
      tags: [`org-slug-${slug}`, `org-${slug}`, "orgs"],
      revalidate: 3600, // 1 hour
    }
  )()
);

export const getCachedBoard = cache((boardId: string, orgId: string) =>
  unstable_cache(
    async () => {
      return prisma.board.findFirst({
        where: { id: boardId, organizationId: orgId, archived: false },
        include: {
          lists: {
            where: { archived: false },
            orderBy: { position: "asc" },
            include: {
              cards: {
                where: { archived: false },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      });
    },
    [`board-${boardId}`],
    {
      tags: [`board-${boardId}`, `org-${orgId}-boards`],
      revalidate: 60, // 1 minute
    }
  )()
);