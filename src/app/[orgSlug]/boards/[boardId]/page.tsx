import { prisma } from "@/lib/prisma";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { notFound } from "next/navigation";
import { BoardView } from "@/components/board/boardview";
import { Member } from "@/components/board/board-header";
import { List as IList, Card as ICard } from "@/types";

interface PageProps {
  params: Promise<{ orgSlug: string; boardId: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { orgSlug, boardId } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) notFound();

  const { role } = await validateOrgAccess(org.id, "viewer");
  const canEdit = role === "owner" || role === "admin" || role === "member";

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      organizationId: org.id,
      archived: false,
    },
  });
  if (!board) notFound();

  const rawLists = await prisma.list.findMany({
    where: {
      boardId: board.id,
      archived: false,
    },
    orderBy: { position: "asc" },
  });

  const listIds = rawLists.map((l) => l.id);

  const rawCards = await prisma.card.findMany({
    where: {
      listId: { in: listIds },
      archived: false,
    },
    orderBy: { position: "asc" },
  });

  // Collect unique assignee IDs from cards
  const assigneeIds = Array.from(
    new Set(
      rawCards
        .map((c) => c.assigneeId)
        .filter((id): id is string => Boolean(id))
    )
  );

  // Fetch users assigned to tasks on this board
  const assignees = assigneeIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: assigneeIds } },
        select: { id: true, name: true, image: true },
      })
    : [];

  const boardMembers: Member[] = assignees.map((user) => ({
    id: user.id,
    name: user.name || "User",
    image: user.image,
  }));

  const lists: IList[] = rawLists.map((l) => ({
    id: l.id,
    boardId: l.boardId,
    name: l.name,
    position: l.position,
    archived: l.archived ?? false,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const cards: ICard[] = rawCards.map((c) => ({
    id: c.id,
    listId: c.listId,
    title: c.title,
    description: c.description || "",
    dueDate: c.dueDate ? c.dueDate.toISOString() : null,
    assigneeId: c.assigneeId || null,
    position: c.position,
    archived: c.archived ?? false,
    createdBy: c.createdBy,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  const overdueCount = cards.filter((c) => c.dueDate && new Date(c.dueDate) < new Date()).length;

  return (
    <BoardView
      boardId={boardId}
      boardName={board.name}
      canEdit={canEdit}
      lists={lists}
      cards={cards}
      members={boardMembers}
      orgName={org.name}
      overdueCount={overdueCount}
    />
  );
}