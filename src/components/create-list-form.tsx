"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createList } from "@/actions/lists-action";

export default function CreateListForm({
  boardId,
  orgSlug,
}: {
  boardId: string;
  orgSlug: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("boardId", boardId);
      formData.append("orgSlug", orgSlug);
      await createList(formData);
      setName("");
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
        className="w-72 bg-white/80 hover:bg-white text-gray-700 hover:text-black shrink-0 flex items-center justify-start gap-2 border border-gray-200 shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Add another list
      </Button>
    );
  }

  return (
    <Card className="w-72 p-3 bg-gray-100 border border-gray-200 shrink-0">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Input
          autoFocus
          placeholder="Enter list title..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm focus-visible:ring-primary border-gray-300"
          required
        />
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={loading || !name.trim()}
            className="bg-primary hover:bg-primary/90 text-xs font-semibold px-3 h-8"
          >
            {loading ? "Adding..." : "Add list"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
