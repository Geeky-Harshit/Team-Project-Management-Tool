"use client";

import { useState } from "react";
import { createList } from "@/actions/lists-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface AddListProps {
    boardId: string;
    orgId: string;
}

export function AddList({ boardId, orgId }: AddListProps) {
    const [isAddingList, setIsAddingList] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim() || !orgId) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", newListName.trim());
            formData.append("boardId", boardId);
            formData.append("orgId", orgId);

            await createList(formData);
            setNewListName("");
            setIsAddingList(false);
            toast.success("List created successfully");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create list");
        } finally {
            setLoading(false);
        }
    };

    if (isAddingList) {
        return (
            <form onSubmit={handleCreateList} className="flex items-center gap-1.5">
                <Input
                    autoFocus
                    placeholder="List name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="h-8 text-xs w-40 bg-white focus-visible:ring-primary"
                    disabled={loading}
                    required
                />
                <Button
                    type="submit"
                    size="sm"
                    disabled={loading || !newListName.trim()}
                    className="h-8 text-xs px-3 bg-primary hover:bg-primary/90"
                >
                    {loading ? "Adding..." : "Add"}
                </Button>
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