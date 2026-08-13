"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCard } from "@/actions/cards-action";

export default function CreateCardForm({
  listId,
  boardId,
  orgSlug,
}: {
  listId: string;
  boardId: string;
  orgSlug: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("listId", listId);
      formData.append("boardId", boardId);
      formData.append("orgSlug", orgSlug);
      await createCard(formData);
      setTitle("");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        className="w-full text-gray-500 hover:text-black justify-start gap-2 h-8 px-2 py-1 text-xs"
      >
        <Plus className="h-3.5 w-3.5" />
        Add a card
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-1">
      <Input
        autoFocus
        placeholder="Enter a title for this card..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 text-xs focus-visible:ring-primary border-gray-300 bg-white"
        required
      />
      <div className="flex items-center gap-1">
        <Button
          type="submit"
          size="sm"
          disabled={loading || !title.trim()}
          className="bg-primary hover:bg-primary/90 text-[10px] font-semibold px-2.5 h-7"
        >
          {loading ? "Adding..." : "Add card"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-7 w-7 text-gray-400 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </form>
  );
}
