import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Card } from "@/types";
import { ScrollFade } from "../scroll-fade";

export function OverdueTasksList({ tasks }: { tasks: Card[] }) {
  return (
    <UICard className="h-full min-h-0 rounded-xl border border-gray-200 font-sans shadow-xs">
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
                <span suppressHydrationWarning={true} className="rounded-full border border-red-200/60 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
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