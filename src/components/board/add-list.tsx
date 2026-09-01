"use client";

import { createList } from "@/actions/lists-action";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AddListProps {
  boardId: string;
  orgId: string;
}

export default function AddList({ boardId, orgId }: AddListProps) {
  const [isAddingList, setIsAddingList] = useState(false);
  const router = useRouter();

  async function handleCreateList(formData: FormData) {
    const result = await createList(formData);

    if (!result.ok) {
      toast.error(result.error ?? "Failed to create list");
      return;
    }

    setIsAddingList(false);
    router.refresh();
    toast.success("List created successfully");
  }

  if (isAddingList) {
    return (
      <form action={handleCreateList} className="flex items-center gap-1.5">
        <input type="hidden" name="boardId" value={boardId} />
        <input type="hidden" name="orgId" value={orgId} />
        <Input
          autoFocus
          name="name"
          placeholder="List name..."
          className="h-8 text-xs w-40 bg-white focus-visible:ring-primary"
          required
        />
        <FormSubmitButton
          pendingLabel="Adding..."
          size="sm"
          className="h-8 text-xs px-3 bg-primary hover:bg-primary/90"
        >
          Add
        </FormSubmitButton>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsAddingList(false)}
          className="h-8 w-8 text-gray-400 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </form>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsAddingList(true)}
      className="text-xs font-semibold gap-1.5 h-8 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
    >
      <Plus className="h-3.5 w-3.5 text-primary" />
      Add List
    </Button>
  );
}
