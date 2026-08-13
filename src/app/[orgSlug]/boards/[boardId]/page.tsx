import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import Board from "@/models/board/Board";
import List from "@/models/board/List";
import CardModel from "@/models/card/Card";
import { notFound, redirect } from "next/navigation";
import CreateListForm from "@/components/create-list-form";
import CreateCardForm from "@/components/create-card-form";
import { Card } from "@/components/ui/card";

interface PageProps {
  params: Promise<{
    orgSlug: string;
    boardId: string;
  }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { orgSlug, boardId } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  await connectDB();

  // 1. Fetch Board
  const board = await Board.findOne({
    _id: boardId,
    archived: false,
  });

  if (!board) {
    notFound();
  }

  // 2. Fetch columns/lists
  const lists = await List.find({
    boardId: board._id,
    archived: false,
  }).sort({ position: 1 });

  // 3. Fetch cards belonging to lists
  const cards = await CardModel.find({
    listId: { $in: lists.map((list) => list._id) },
    archived: false,
  }).sort({ position: 1 });

  // Group cards by listId
  const cardsByListId = lists.reduce<Record<string, typeof cards>>((acc, list) => {
    acc[list._id.toString()] = cards.filter(
      (card) => card.listId.toString() === list._id.toString()
    );
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 h-full font-sans">
      {/* Board Header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
        <p className="text-xs text-gray-500">Manage tasks and progress lists</p>
      </div>

      {/* Columns Grid */}
      <div className="flex-1 overflow-x-auto pb-4 flex gap-4 items-start">
        {lists.map((list) => {
          const listIdStr = list._id.toString();
          const listCards = cardsByListId[listIdStr] || [];

          return (
            <div
              key={listIdStr}
              className="w-72 bg-gray-100 rounded-xl p-3 shrink-0 flex flex-col gap-3 max-h-[70vh] border border-gray-200"
            >
              {/* Column Title */}
              <div className="flex items-center justify-between px-1">
                <span className="font-semibold text-gray-700 text-sm">{list.name}</span>
                <span className="text-xs font-bold text-gray-400 bg-gray-200/50 rounded-full px-2 py-0.5">
                  {listCards.length}
                </span>
              </div>

              {/* Column Cards (scrollable) */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
                {listCards.map((card) => (
                  <Card
                    key={card._id.toString()}
                    className="p-3 bg-white hover:border-primary cursor-pointer border-gray-200 shadow-xs text-xs font-medium text-gray-800 transition duration-100"
                  >
                    {card.title}
                  </Card>
                ))}
              </div>

              {/* Add Card Form Trigger */}
              <CreateCardForm
                listId={listIdStr}
                boardId={boardId}
              />
            </div>
          );
        })}

        {/* Add List Form Trigger */}
        <CreateListForm boardId={boardId} />
      </div>
    </div>
  );
}
