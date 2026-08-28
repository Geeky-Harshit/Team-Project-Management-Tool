"use client";

import { useEffect, useMemo, useState } from "react";
import { addComment } from "@/actions/cards-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOrgMembers } from "@/hooks/useOrgMembers";
import { Comment } from "@/types";
import { CornerDownRight, MessageSquare } from "lucide-react";
import { ScrollFade } from "../scroll-fade";
import { toast } from "sonner";

interface CardCommentsProps {
  cardId: string;
  boardId: string;
  orgId: string;
  canEdit?: boolean;
}

export default function CardComments({
  cardId,
  boardId,
  orgId,
  canEdit = true,
}: CardCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const members = useOrgMembers();
  const getAuthor = (authorId: string) => members.find((m) => m.id === authorId);

  const rootComments = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments]
  );
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId);

  useEffect(() => {
    let canceled = false;
    async function loadComments() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/cards/${cardId}/comments`);
        const data = await res.json();
        if (canceled) return;
        if (!res.ok || !Array.isArray(data)) {
          setError(data.error || "Failed to load comments");
          setComments([]);
          return;
        }
        setComments(data);
      } catch {
        if (!canceled) {
          setError("Failed to load comments");
          setComments([]);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    loadComments();
    return () => {
      canceled = true;
    };
  }, [cardId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !canEdit || !newComment.trim() || posting) return;

    setPosting(true);
    setError("");
    try {
      const created = await addComment(
        cardId,
        boardId,
        orgId,
        newComment.trim(),
        replyToId
      );

      setComments((prev) => [...prev, created])
      setNewComment("");
      setReplyToId(null);
      toast.success("Comment added successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const renderComment = (comm: Comment, isReply = false) => {
    const author = getAuthor(comm.authorId);
    const authorName = author?.name || `User ${comm.authorId.slice(-4)}`;
    const authorInitials = author?.name
      ? author.name.slice(0, 2).toUpperCase()
      : "U";

    return (
      <div
        key={comm.id}
        className={
          isReply
            ? "ml-8 mt-2 bg-gray-50 border border-gray-200 p-2.5 rounded-md text-xs font-sans"
            : "bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs font-sans"
        }
      >
        {/* Comment Header: Real Avatar, Name & Timestamp */}
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarImage src={author?.image || undefined} alt={authorName} />
              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                {authorInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-800 font-semibold text-xs truncate">
              {authorName}
            </span>
          </div>
          <span suppressHydrationWarning className="text-gray-400 shrink-0">
            {new Date(comm.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Comment Body */}
        <p className="text-gray-700 font-medium mt-1 leading-relaxed">
          {comm.content}
        </p>

        {/* Reply Trigger */}
        {canEdit && !isReply && (
          <button
            type="button"
            onClick={() => setReplyToId(comm.id)}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
          >
            <CornerDownRight className="h-3 w-3" />
            Reply
          </button>
        )}

        {/* Nested Replies */}
        {!isReply &&
          getReplies(comm.id).map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100 font-sans">
      <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-800">
        <MessageSquare className="h-4 w-4" />
        Comments
      </h3>

      {canEdit && replyToId && (
        <div className="text-[11px] px-2.5 py-1.5 rounded bg-primary/10 text-primary font-semibold inline-flex items-center gap-2">
          Replying to comment
          <button
            type="button"
            className="underline cursor-pointer"
            onClick={() => setReplyToId(null)}
          >
            cancel
          </button>
        </div>
      )}

      <form onSubmit={handlePostComment} className="flex gap-2">
        <Input
          placeholder={
            !canEdit
              ? "Comments are read-only for viewers..."
              : replyToId
                ? "Write a reply..."
                : "Write a comment..."
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="text-xs h-9 focus-visible:ring-primary font-sans bg-white"
          disabled={posting || !canEdit}
        />
        {canEdit && (
          <Button
            type="submit"
            size="sm"
            disabled={!canEdit || posting || !newComment.trim()}
            className="bg-primary hover:bg-primary/90 text-xs font-sans h-9 px-3"
          >
            {posting ? "Posting..." : "Post"}
          </Button>
        )}
      </form>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {loading ? (
        <p className="text-xs text-gray-500">Loading comments...</p>
      ) : (
        <ScrollFade
          maxHeight="max-h-[18rem]"
          contentClassName="space-y-3 px-1 py-2"
        >
          {rootComments.length === 0 ? (
            <p className="text-xs text-gray-500">No comments yet.</p>
          ) : (
            rootComments.map((comm) => renderComment(comm))
          )}
        </ScrollFade>
      )}
    </div>
  );
}
