"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBoard } from "@/actions/boards-action";
import { showActivityToast } from "@/lib/show-activity-toast";


export default function CreateBoardCard({ organizationId }: { organizationId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("organizationId", organizationId);
      const result = await createBoard(formData);

      if (result.success) {
        showActivityToast("BOARD_CREATED");

        setName("");
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Card
        onClick={() => setIsOpen(true)}
        className="h-44 border-dashed border-2 hover:border-primary border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/5 transition duration-150 group shadow-none"      >
        <Plus className="h-6 w-6 text-gray-400 group-hover:text-primary transition" />
        <span className="text-sm font-medium text-gray-500 group-hover:text-primary transition mt-1">
          Create new board
        </span>
      </Card>
    );
  }

  return (
    <Card className="h-44 p-4 flex flex-col justify-between border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <Input
            autoFocus
            placeholder="Board Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm focus:border-primary"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-gray-400 hover:text-gray-600"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button
          type="submit"
          disabled={loading || !name.trim()}
          className="h-8 bg-primary hover:bg-primary/90 text-sm font-medium"
        >
          {loading ? "Creating..." : "Create"}
        </Button>
      </form>
    </Card>
  );
}
