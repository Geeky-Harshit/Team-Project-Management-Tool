"use client";

import { createBoard } from "@/actions/boards-action";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { showActivityToast } from "@/lib/show-activity-toast";
import { Plus, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

export default function CreateBoardCard({
  organizationId,
}: {
  organizationId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(createBoard, { ok: false });

  useEffect(() => {
    if (!state.ok) return;
    showActivityToast("BOARD_CREATED");
    setIsOpen(false);
  }, [state]);

  if (!isOpen) {
    return (
      <Card
        onClick={() => setIsOpen(true)}
        className="h-44 border-dashed border-2 hover:border-primary border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/5 transition duration-150 group shadow-none"
      >
        <Plus className="h-6 w-6 text-gray-400 group-hover:text-primary transition" />
        <span className="text-sm font-medium text-gray-500 group-hover:text-primary transition mt-1">
          Create new board
        </span>
      </Card>
    );
  }

  return (
    <Card className="h-44 p-4 flex flex-col justify-between border-gray-200 shadow-sm">
      <form action={formAction} className="h-full flex flex-col justify-between">
        <input type="hidden" name="organizationId" value={organizationId} />
        <div className="flex items-center justify-between gap-2">
          <Input
            autoFocus
            name="name"
            placeholder="Board Title"
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
        {state.error && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}
        <FormSubmitButton
          pendingLabel="Creating..."
          className="h-8 bg-primary hover:bg-primary/90 text-sm font-medium"
        >
          Create
        </FormSubmitButton>
      </form>
    </Card>
  );
}
