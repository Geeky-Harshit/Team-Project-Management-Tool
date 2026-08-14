"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-xs text-gray-500">No tasks assigned to members.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.assignee} className="flex justify-between items-center text-xs py-1">
              <span className="text-gray-600 font-medium">{entry.assignee}</span>
              <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
                {entry.count} cards
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}