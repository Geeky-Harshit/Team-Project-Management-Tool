"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollFade } from "../scroll-fade";

export interface WorkloadEntry {
  assignee: string;
  count: number;
}

export function WorkloadBreakdown({ entries }: { entries: WorkloadEntry[] }) {
  return (
    <Card className="border-gray-200 shadow-sm font-sans">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Workload Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollFade maxHeight="max-h-[20rem]" contentClassName="space-y-3 px-4 py-3">
          {entries.length === 0 ? (
            <p className="text-xs text-gray-500">No tasks assigned to members.</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.assignee} className="flex items-center justify-between gap-2 text-xs py-1">
                <span className="font-medium text-gray-600">{entry.assignee}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-bold text-gray-900">
                  {entry.count} cards
                </span>
              </div>
            ))
          )}
        </ScrollFade>
      </CardContent>
    </Card>
  );
}