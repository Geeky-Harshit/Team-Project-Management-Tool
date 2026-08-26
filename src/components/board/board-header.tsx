"use client";

import { archiveBoard } from "@/actions/boards-action";
import { Button } from "@/components/ui/button";
import { useOrgs } from "@/hooks/useOrgs";
import { showActivityToast } from "@/lib/show-activity-toast";
import { MemberUser as IMember } from "@/types";
import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import AddList from "./add-list";
import BoardTitle from "./board-title";
import MemberFilterBar from "./member-filter-bar";

interface BoardHeaderProps {
  boardId: string;
  initialName: string;
  canEdit?: boolean;
  isAdmin?: boolean;
  members?: IMember[];
  selectedAssigneeId?: string | null;
  onSelectAssignee?: (id: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function BoardHeader({
  boardId,
  initialName,
  canEdit = true,
  isAdmin = false,
  members = [],
  selectedAssigneeId = null,
  onSelectAssignee,
  searchQuery = "",
  onSearchChange,
}: BoardHeaderProps) {
  const { currentOrg } = useOrgs();
  const [loading, setLoading] = useState(false);

  const router = useRouter()

  const handleArchive = async () => {
    if (!confirm("Archive this board?") || !currentOrg) return;

    setLoading(true);

    try {
      await archiveBoard(boardId, currentOrg.id);
      showActivityToast("BOARD_ARCHIVED");
      router.replace(`/${currentOrg.slug}/boards`)
    } catch (err) {
      console.error("Archive failed:", err);
      toast.error("Failed to archive board");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 shrink-0 pb-4 border-b border-gray-200 font-sans">
      {/* Top Row: Board Title & Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        <BoardTitle
          boardId={boardId}
          initialName={initialName}
          orgId={currentOrg?.id || ""}
          canEdit={canEdit}
        />

        {canEdit && (
          <div className="flex items-center gap-2">
            <AddList boardId={boardId} orgId={currentOrg?.id || ""} />
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleArchive}
                disabled={loading}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold gap-1.5 h-8"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive Board
              </Button>
            )}
          </div>
        )}
      </div >
      {/* Bottom Row: Search + Avatars */}
      <MemberFilterBar
        members={members}
        selectedAssigneeId={selectedAssigneeId}
        onSelectAssignee={onSelectAssignee}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
    </div >
  );
}