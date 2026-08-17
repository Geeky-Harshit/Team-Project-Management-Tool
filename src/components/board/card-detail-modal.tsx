"use client";

import { addComment, updateCardDetails } from "@/actions/cards-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOrgs } from "@/hooks/useOrgs";
import { authClient } from "@/lib/auth/auth-client";
import { Comment, Card as ICard } from "@/types";
import { Calendar, CornerDownRight, MessageSquare, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ScrollFade } from "../scroll-fade";

interface CardDetailModalProps {
  card: ICard;
  boardId: string;
  onClose: () => void;
}

interface OrgMemberOption {
  id: string;
  name: string;
  email: string;
}

export function CardDetailModal({ card, boardId, onClose }: CardDetailModalProps) {
  const { currentOrg } = useOrgs();

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.slice(0, 10) : "");
  const [assigneeId, setAssigneeId] = useState(card.assigneeId || "");

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");

  const [members, setMembers] = useState<OrgMemberOption[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const [savingDetails, setSavingDetails] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const rootComments = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments],
  );

  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId);

  useEffect(() => {
    let canceled = false;

    async function loadComments() {
      setCommentsLoading(true);
      setCommentsError("");

      try {
        const res = await fetch("/api/cards/" + card.id + "/comments");
        const data = (await res.json()) as Comment[] | { error?: string };

        if (canceled) return;

        if (!res.ok || !Array.isArray(data)) {
          const message =
            !Array.isArray(data) && data.error
              ? data.error
              : "Failed to load comments";
          setCommentsError(message);
          setComments([]);
          return;
        }

        setComments(data);
      } catch {
        if (!canceled) {
          setCommentsError("Failed to load comments");
          setComments([]);
        }
      } finally {
        if (!canceled) setCommentsLoading(false);
      }
    }

    loadComments();

    return () => {
      canceled = true;
    };
  }, [card.id]);

  useEffect(() => {
    let canceled = false;

    async function loadMembers() {
      if (!currentOrg) return;
      setMembersLoading(true);

      try {
        const res = await authClient.organization.listMembers({
          query: { organizationId: currentOrg.id },
        });

        if (canceled) return;

        if (!res.data) {
          setMembers([]);
          return;
        }

        const nextMembers = res.data.members.map((m) => ({
          id: m.user.id,
          name: m.user.name || "Unknown",
          email: m.user.email || "unknown@example.com",
        }));

        setMembers(nextMembers);
      } catch {
        if (!canceled) setMembers([]);
      } finally {
        if (!canceled) setMembersLoading(false);
      }
    }

    loadMembers();

    return () => {
      canceled = true;
    };
  }, [currentOrg]);

  const handleSaveDetails = async () => {
    if (!currentOrg) return;

    setActionError("");
    setSavingDetails(true);

    try {
      await updateCardDetails(card.id, boardId, currentOrg.id, {
        title: title.trim(),
        description: description.trim(),
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save card details";
      setActionError(message);
    } finally {
      setSavingDetails(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    if (!newComment.trim()) return;

    setActionError("");
    setPostingComment(true);

    try {
      const created = await addComment(
        card.id,
        boardId,
        currentOrg.id,
        newComment,
        replyToCommentId,
      );

      const normalized: Comment =
        "id" in created
          ? (created as Comment)
          : {
            id: (created as { _id: { toString: () => string } })._id.toString(),
            cardId: card.id,
            authorId: (created as { authorId: string }).authorId,
            content: (created as { content: string }).content,
            parentId: (created as { parentId?: { toString: () => string } | null }).parentId
              ? (created as { parentId: { toString: () => string } }).parentId.toString()
              : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

      setComments((prev) => [...prev, normalized]);
      setNewComment("");
      setReplyToCommentId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to post comment";
      setActionError(message);
    } finally {
      setPostingComment(false);
    }
  };

  const renderComment = (comm: Comment, isReply = false) => (
    <div
      key={comm.id}
      className={
        isReply
          ? "ml-8 mt-2 bg-gray-50 border p-2.5 rounded-md text-xs"
          : "bg-gray-50 border p-3 rounded-lg text-xs"
      }
    >
      <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
        <span>User: {comm.authorId.slice(-6)}</span>
        <span suppressHydrationWarning>
          {new Date(comm.createdAt).toLocaleString("en-IN")}
        </span>
      </div>

      <p className="text-gray-700 font-medium mt-1">{comm.content}</p>

      {!isReply && (
        <button
          type="button"
          onClick={() => setReplyToCommentId(comm.id)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
        >
          <CornerDownRight className="h-3 w-3" />
          Reply
        </button>
      )}

      {!isReply &&
        getReplies(comm.id).map((reply) => renderComment(reply, true))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white rounded-xl max-w-3xl w-full flex flex-col max-h-[88vh] border border-gray-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold border-none shadow-none focus-visible:ring-0 p-0 h-8 font-sans"
            disabled={savingDetails}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {actionError && (
            <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-md font-medium">
              {actionError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Description</label>
                <Textarea
                  placeholder="Add a more detailed description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs h-28 focus-visible:ring-primary font-sans"
                  disabled={savingDetails}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-800">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </h3>

                {replyToCommentId && (
                  <div className="text-[11px] px-2.5 py-1.5 rounded bg-primary/10 text-primary font-semibold inline-flex items-center gap-2">
                    Replying to comment
                    <button
                      type="button"
                      className="underline"
                      onClick={() => setReplyToCommentId(null)}
                    >
                      cancel
                    </button>
                  </div>
                )}

                <form onSubmit={handlePostComment} className="flex gap-2">
                  <Input
                    placeholder={
                      replyToCommentId
                        ? "Write a reply..."
                        : "Write a comment..."
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="text-xs h-9 focus-visible:ring-primary font-sans"
                    disabled={postingComment || savingDetails}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      postingComment ||
                      savingDetails ||
                      !newComment.trim()
                    }
                    className="bg-primary hover:bg-primary/90 text-xs font-sans"
                  >
                    {postingComment ? "Posting..." : "Post"}
                  </Button>
                </form>

                {commentsLoading ? (
                  <p className="text-xs text-gray-500">Loading comments...</p>
                ) : commentsError ? (
                  <p className="text-xs text-destructive">{commentsError}</p>
                ) : (
                  <ScrollFade maxHeight="max-h-[20rem]" contentClassName="space-y-3 px-4 py-3">
                    <div className="space-y-3 pt-2">
                      {rootComments.length === 0 ? (
                        <p className="text-xs text-gray-500">No comments yet.</p>
                      ) : (
                        rootComments.map((comm) => renderComment(comm))
                      )}
                    </div>
                  </ScrollFade>
                )}
              </div>
            </div>

            <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 h-fit">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Metadata
              </h4>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md p-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={savingDetails || membersLoading}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs h-8 bg-white focus-visible:ring-primary font-sans"
                  disabled={savingDetails}
                />
              </div>

              <Button
                type="button"
                onClick={handleSaveDetails}
                disabled={savingDetails || postingComment}
                className="w-full text-xs"
              >
                {savingDetails ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}