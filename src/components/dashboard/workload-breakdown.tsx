import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkloadEntry } from "@/types";
import { ScrollFade } from "../scroll-fade";

export function WorkloadBreakdown({ entries }: { entries: WorkloadEntry[] }) {
  return (
    <Card className="h-full min-h-0 border-gray-200 shadow-sm font-sans">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base font-semibold">Workload Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <ScrollFade
          className="h-full min-h-0 flex-1"
          maxHeight="h-full"
          contentClassName="space-y-3 px-4 py-3"
        >
          {entries.length === 0 ? (
            <p className="text-xs text-gray-500">No tasks assigned to members.</p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.email || entry.assignee}
                className="flex items-center justify-between gap-3 text-xs py-1"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {entry.assignee.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-800 truncate">
                      {entry.assignee}
                    </span>
                    {entry.email && (
                      <span className="text-[11px] text-gray-400 truncate">
                        {entry.email}
                      </span>
                    )}
                  </div>
                </div>

                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-bold text-gray-900 shrink-0">
                  {entry.count} {entry.count === 1 ? "task" : "tasks"}
                </span>
              </div>
            ))
          )}
        </ScrollFade>
      </CardContent>
    </Card>
  );
}
