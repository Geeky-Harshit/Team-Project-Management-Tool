import { OrgMembersProvider } from "@/context/org-members-context";
import { Card as ICard, List as IList, MemberUser as IMember } from "@/types";
import { BoardClient } from "./board-client";

interface BoardViewProps {
  boardId: string;
  boardName: string;
  canEdit: boolean;
  isAdmin?: boolean;
  lists: IList[];
  cards: ICard[];
  members: IMember[];
  orgName: string;
  overdueCount: number;
}

export default function BoardView({
  boardId,
  boardName,
  canEdit,
  isAdmin,
  lists,
  cards,
  members,
  orgName,
  overdueCount,
}: BoardViewProps) {
  return (
    <OrgMembersProvider members={members}>
      <div className="flex h-full w-full flex-col gap-6 font-sans">
        {/* Stats Grid rendered on Server — never re-renders on search */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Lists</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{lists.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Tasks</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{cards.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Overdue</p>
              <p className="mt-1 text-xl font-bold text-red-600">{overdueCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Organization</p>
              <p className="mt-1 truncate text-sm font-semibold text-gray-900">{orgName}</p>
            </div>
          </div>

          <BoardClient
            boardId={boardId}
            boardName={boardName}
            canEdit={canEdit}
            isAdmin={isAdmin}
            lists={lists}
            cards={cards}
            members={members}
          />
        </section>
      </div>
    </OrgMembersProvider>
  );
}
