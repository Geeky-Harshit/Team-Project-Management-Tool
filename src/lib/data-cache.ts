import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

async function loadOrgBySlug(slug: string) {
  "use cache";
  cacheTag(`org-slug-${slug}`, `org-${slug}`, "orgs");
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 });

  return prisma.organization.findUnique({
    where: { slug },
  });
}

async function loadBoard(boardId: string, orgId: string) {
  "use cache";
  cacheTag(`board-${boardId}`, `org-${orgId}-boards`);
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });

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
}

export const getCachedOrgBySlug = cache((slug: string) => loadOrgBySlug(slug));

export const getCachedBoard = cache((boardId: string, orgId: string) =>
  loadBoard(boardId, orgId),
);
