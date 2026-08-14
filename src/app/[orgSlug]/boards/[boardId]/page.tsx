import connectDB from "@/lib/db";
import Board from "@/models/board/Board";
import List from "@/models/board/List";
import CardModel from "@/models/card/Card";
import Organization from "@/models/organization/Organization";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { notFound } from "next/navigation";
import { BoardHeader } from "@/components/board/board-header";
import { KanbanBoard } from "@/components/board/kanban-board";
import { List as IList, Card as ICard } from "@/types";

interface PageProps {
  params: Promise<{ orgSlug: string; boardId: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { orgSlug, boardId } = await params;

  await connectDB();
  const org = await Organization.findOne({ slug: orgSlug });
  if (!org) notFound();

  await validateOrgAccess(org._id.toString(), "viewer");

  const board = await Board.findOne({
    _id: boardId,
    organizationId: org._id,
    archived: false,
  });
  if (!board) notFound();

  const rawLists = await List.find({ boardId: board._id, archived: false }).sort({ position: 1 });
  const rawCards = await CardModel.find({
    listId: { $in: rawLists.map((l) => l._id) },
    archived: false,
  }).sort({ position: 1 });

  const lists: IList[] = rawLists.map((l) => ({
    id: l._id.toString(),
    boardId: l.boardId.toString(),
    name: l.name,
    position: l.position,
    archived: l.archived ?? false,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const cards: ICard[] = rawCards.map((c) => ({
    id: c._id.toString(),
    listId: c.listId.toString(),
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

  return (
    <div className="flex flex-col gap-6 h-full p-6 font-sans">
      <BoardHeader boardId={boardId} initialName={board.name} />
      <KanbanBoard
        initialLists={lists}
        initialCards={cards}
        boardId={boardId}
      />
    </div>
  );
}