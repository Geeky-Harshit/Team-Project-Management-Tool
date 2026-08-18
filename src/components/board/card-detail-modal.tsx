"use client";

import { useEffect, useMemo, useState } from "react";
import { updateCardDetails } from "@/actions/cards-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOrgs } from "@/hooks/useOrgs";
import { authClient } from "@/lib/auth/auth-client";
import { Card as ICard } from "@/types";
import { Calendar, User, X } from "lucide-react";
import { toast } from "sonner";
import { CardComments } from "./card-comments";

interface CardDetailModalProps {
  card: ICard;
  boardId: string;
  onClose: () => void;
  canEdit?: boolean;
}

interface OrgMember {
  id: string;
  name: string;
  email: string;
}

export function CardDetailModal({ card, boardId, onClose, canEdit = true }: CardDetailModalProps) {
  const { currentOrg } = useOrgs();

  const [formData, setFormData] = useState({
    title: card.title,
    description: card.description || "",
    dueDate: card.dueDate ? card.dueDate.slice(0, 10) : "",
    assigneeId: card.assigneeId || "",
  });

  const [members, setMembers] = useState<OrgMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = useMemo(() => {
    return (
      formData.title.trim() !== card.title.trim() ||
      formData.description.trim() !== (card.description || "").trim() ||
      formData.dueDate !== (card.dueDate ? card.dueDate.slice(0, 10) : "") ||
      formData.assigneeId !== (card.assigneeId || "")
    );
  }, [formData, card]);

  useEffect(() => {
    if (!currentOrg) return;
    setMembersLoading(true);
    authClient.organization
      .listMembers({ query: { organizationId: currentOrg.id } })
      .then((res) => {
        if (res.data?.members) {
          setMembers(
            res.data.members.map((m) => ({
              id: m.user.id,
              name: m.user.name || "Unknown",
              email: m.user.email || "",
            }))
          );
        }
      })
      .finally(() => setMembersLoading(false));
  }, [currentOrg]);

  const handleSave = async () => {
    if (!currentOrg || !canEdit || !hasChanges || !formData.title.trim()) return;

    setError("");
    setSaving(true);
    try {
      await updateCardDetails(card.id, boardId, currentOrg.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assigneeId: formData.assigneeId || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      });
      toast.success("Card updated successfully");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save card details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white rounded-xl max-w-3xl w-full flex flex-col max-h-[88vh] border border-gray-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Input
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="text-lg font-bold border-none shadow-none focus-visible:ring-0 p-0 h-8 font-sans"
            disabled={saving || !canEdit}
          />
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-md font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Description & Comments Component */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Description</label>
                <Textarea
                  placeholder={canEdit ? "Add a more detailed description..." : "No description provided."}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="text-xs h-28 focus-visible:ring-primary font-sans"
                  disabled={saving || !canEdit}
                />
              </div>

              {currentOrg && (
                <CardComments
                  cardId={card.id}
                  boardId={boardId}
                  orgId={currentOrg.id}
                  canEdit={canEdit}
                />
              )}
            </div>

            {/* Right: Metadata Sidebar */}
            <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 h-fit">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metadata</h4>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Assignee
                </label>
                {
                  canEdit
                    ? (<select
                      value={formData.assigneeId}
                      onChange={(e) => handleChange("assigneeId", e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-md p-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      disabled={saving || membersLoading}
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>)
                    : <div className="w-full text-xs border border-gray-200 rounded-md p-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
                      {
                        formData.assigneeId
                          ? <span>{members.find((m) => m.id === formData.assigneeId)?.name}</span>
                          : <span>Unassigned</span>
                      }
                    </div>
                }
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  className="text-xs h-8 bg-white focus-visible:ring-primary font-sans"
                  disabled={saving || !canEdit}
                />
              </div>

              {
                canEdit && <Button
                  type="button"
                  onClick={handleSave}
                  disabled={!canEdit || !hasChanges || saving || !formData.title.trim()}
                  className="w-full text-xs font-semibold"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
