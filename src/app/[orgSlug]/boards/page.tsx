import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import Organization from "@/models/organization/Organization";
import Board from "@/models/board/Board";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import CreateBoardCard from "@/components/create-board-card";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function BoardsPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  await connectDB();
  const org = await Organization.findOne({ slug: orgSlug });
  if (!org) {
    notFound();
  }

  const boards = await Board.find({
    organizationId: org._id,
    archived: false,
  }).sort({ createdAt: -1 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
        <p className="text-sm text-gray-500">View and manage your team&apos;s boards</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {boards.map((board) => (
          <Link key={board._id.toString()} href={`/${orgSlug}/board/${board._id.toString()}`}>
            <Card className="h-32 flex flex-col justify-between p-4 cursor-pointer hover:border-primary transition duration-150 shadow-sm border-gray-200">
              <h3 className="font-semibold text-gray-800 text-base line-clamp-2">{board.name}</h3>
              <span className="text-xs text-gray-400">Created {new Date(board.createdAt).toLocaleDateString()}</span>
            </Card>
          </Link>
        ))}
        <CreateBoardCard organizationId={org._id.toString()} />
      </div>
    </div>
  );
}
