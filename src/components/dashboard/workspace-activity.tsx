"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@/types";
import { ScrollFade } from "../scroll-fade";

export function WorkspaceActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Card className="border-gray-200 shadow-sm h-full font-sans">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Workspace Activity</CardTitle>
      </CardHeader>
      <ScrollFade maxHeight="h-full" contentClassName="mt-3 p-1 flex flex-col min-h-24">
        <CardContent className="space-y-4 h-full pr-2">
          {activities.length === 0 ? (
            <p className="text-xs text-gray-500">No recent workspace activity.</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="text-xs border-l-2 border-primary/20 pl-3 py-1 flex flex-col gap-0.5">
                <span className="text-gray-700 font-medium">{act.message}</span>
                <span suppressHydrationWarning={true} className="text-[10px] text-gray-400">
                  {new Date(act.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))
          )}
        </CardContent>
        </ScrollFade>
    </Card>
  );
}