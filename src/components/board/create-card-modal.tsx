"use client";

import { createCard } from "@/actions/cards-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOrgMembers } from "@/hooks/useOrgMembers";
import { useOrgs } from "@/hooks/useOrgs";
import { AlignLeft, Calendar, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CreateCardModalProps {
  listId: string;
  listName: string;
  boardId: string;
  onClose: () => void;
}

export default function CreateCardModal({
  listId,
  listName,
  boardId,
  onClose,
}: CreateCardModalProps) {
  const router = useRouter();
  const { currentOrg } = useOrgs();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const members = useOrgMembers()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentOrg) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("assigneeId", assigneeId);
      formData.append("dueDate", dueDate);
      formData.append("listId", listId);
      formData.append("boardId", boardId);
      formData.append("orgId", currentOrg.id);

      await createCard(formData);
      toast.success("Card created successfully");
      router.refresh();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white rounded-xl max-w-lg w-full flex flex-col border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Create Card</h2>
            <p className="text-xs text-gray-500">Adding to <span className="font-semibold text-gray-700">{listName}</span></p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Card Title *</label>
            <Input
              autoFocus
              placeholder="e.g. Design landing page hero"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm h-9 focus-visible:ring-primary font-sans"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <AlignLeft className="h-3.5 w-3.5 text-gray-400" />
              Description
            </label>
            <Textarea
              placeholder="Add details, notes, or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs h-24 focus-visible:ring-primary font-sans"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md p-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary h-9"
                disabled={loading}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.email ? `(${m.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs h-9 bg-white focus-visible:ring-primary font-sans"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !title.trim()}
              className="bg-primary hover:bg-primary/90 text-xs font-semibold px-4"
            >
              {loading ? "Creating..." : "Create Card"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
