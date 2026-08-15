"use client";

import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Card } from "@/types";

export function OverdueTasksList({ tasks }: { tasks: Card[] }) {
  return (
    <UICard className="border-gray-200 shadow-sm font-sans">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Overdue Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-500">No overdue tasks. Nice work!</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex justify-between items-center text-xs py-2 border-b last:border-b-0">
              <span className="font-medium text-gray-800">{task.title}</span>
              <span suppressHydrationWarning={true} className="text-red-500 bg-red-50 px-2 py-0.5 rounded font-semibold border border-red-200/50">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-IN") : ""}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </UICard>
  );
}