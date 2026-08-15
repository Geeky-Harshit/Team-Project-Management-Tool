"use client";

import { useState } from "react";
import { updateCardDetails, addComment } from "@/actions/cards-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card as ICard, Comment } from "@/types";
import { Calendar, User, X, MessageSquare } from "lucide-react";
import { useOrgs } from "@/hooks/useOrgs";

interface CardDetailModalProps {
  card: ICard;
  comments: Comment[];
  boardId: string;
  onClose: () => void;
}

export function CardDetailModal({
  card,
  comments: initialComments,
  boardId,
  onClose,
}: CardDetailModalProps) {
  const { currentOrg } = useOrgs();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.slice(0, 10) : "");
  const [assigneeId, setAssigneeId] = useState(card.assigneeId || "");

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveDetails = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      await updateCardDetails(card.id, boardId, currentOrg.id, {
        title,
        description,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentOrg) return;
    setLoading(true);
    try {
      const commentDoc = await addComment(card.id, boardId, currentOrg.id, newComment);
      setComments((prev) => [
        ...prev,
        {
          id: commentDoc._id.toString(),
          cardId: commentDoc.cardId.toString(),
          authorId: commentDoc.authorId,
          content: commentDoc.content,
          parentId: commentDoc.parentId ? commentDoc.parentId.toString() : null,
          createdAt: commentDoc.createdAt.toISOString(),
          updatedAt: commentDoc.updatedAt.toISOString(),
        },
      ]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white rounded-xl max-w-2xl w-full flex flex-col max-h-[85vh] border border-gray-200 shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between p-4 border-b">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveDetails}
            className="text-lg font-bold border-none shadow-none focus-visible:ring-0 p-0 h-8 font-sans"
            disabled={loading}
          />
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Description</label>
                <Textarea
                  placeholder="Add a more detailed description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSaveDetails}
                  className="text-xs h-28 focus-visible:ring-primary font-sans"
                  disabled={loading}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-800">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </h3>

                <form onSubmit={handlePostComment} className="flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="text-xs h-9 focus-visible:ring-primary font-sans"
                    disabled={loading}
                  />
                  <Button type="submit" size="sm" disabled={loading || !newComment.trim()} className="bg-primary hover:bg-primary/90 text-xs font-sans">
                    Post
                  </Button>
                </form>

                <div className="space-y-3 pt-2">
                  {comments.map((comm) => (
                    <div key={comm.id} className="bg-gray-50 border p-3 rounded-lg flex flex-col gap-1 text-xs font-sans">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                        <span>User: {comm.authorId.slice(-4)}</span>
                        <span suppressHydrationWarning={true} >{new Date(comm.createdAt).toLocaleString("en-IN")}</span>
                      </div>
                      <p className="text-gray-700 font-medium">{comm.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 h-fit">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metadata</h4>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Assignee ID
                </label>
                <Input
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  onBlur={handleSaveDetails}
                  placeholder="User ID string"
                  className="text-xs h-8 bg-white focus-visible:ring-primary font-sans"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={handleSaveDetails}
                  className="text-xs h-8 bg-white focus-visible:ring-primary font-sans"
                  disabled={loading}
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}