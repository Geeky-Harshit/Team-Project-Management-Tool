import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Card } from "@/types";
import { ScrollFade } from "../scroll-fade";

export function OverdueTasksList({ tasks }: { tasks: Card[] }) {
  return (
    <UICard className="h-full min-h-0 border-gray-200 shadow-sm font-sans">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base font-semibold">Overdue Tasks</CardTitle>
      </CardHeader>
      <ScrollFade
        className="h-full min-h-0 flex-1"
        maxHeight="h-full"
        contentClassName="mt-0 flex flex-col"
      >
        <CardContent className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-[10px] text-gray-500">No overdue tasks. Nice work!</p>
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
      </ScrollFade>
    </UICard>
  );
}