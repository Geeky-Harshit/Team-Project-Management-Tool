"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@/types";
import { Activity as ActivityIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollFade } from "../scroll-fade";

interface WorkspaceActivityFeedProps {
  activities: Activity[];
}

const ITEM_HEIGHT = 56; // Estimated item height in pixels
const OVERSCAN = 5;     // Extra items to render above and below viewport

export function WorkspaceActivityFeed({ activities }: WorkspaceActivityFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(400);

  const totalHeight = activities.length * ITEM_HEIGHT;

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const currentScrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;

    setScrollTop(currentScrollTop);
    setViewportHeight(clientHeight || 400);

  }, [totalHeight]);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  // Virtualization window calculation
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    if (activities.length === 0) return { startIndex: 0, endIndex: 0, offsetY: 0 };

    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT) + OVERSCAN * 2;
    const end = Math.min(activities.length, start + visibleCount);
    const offset = start * ITEM_HEIGHT;

    return { startIndex: start, endIndex: end, offsetY: offset };
  }, [activities.length, scrollTop, viewportHeight]);

  const visibleActivities = useMemo(() => {
    return activities.slice(startIndex, endIndex);
  }, [activities, startIndex, endIndex]);

  return (
    <Card className="border-gray-200 shadow-sm flex flex-col font-sans h-[500px]">
      <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-primary" />
          Workspace Activity
        </CardTitle>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
          {activities.length} total
        </span>
      </CardHeader>
      <ScrollFade maxHeight="h-full" contentClassName="mt-3 p-1 flex flex-col min-h-24">
        <CardContent className="p-0 relative flex-1 overflow-hidden min-h-0">

          {/* Scrollable Virtualized Container */}
          <div
            ref={containerRef}
            onScroll={updateScrollState}
            className="h-full overflow-y-auto px-4 py-2"
          >
            {activities.length === 0 ? (
              <div className="flex h-full min-h-40 items-center justify-center text-center">
                <p className="text-xs text-gray-500">No recent workspace activity.</p>
              </div>
            ) : (
              <div
                style={{ height: `${totalHeight}px`, position: "relative" }}
                className="w-full"
              >
                <div
                  style={{
                    transform: `translateY(${offsetY}px)`,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                  }}
                  className="space-y-2"
                >
                  {visibleActivities.map((act) => (
                    <div
                      key={act.id}
                      style={{ height: `${ITEM_HEIGHT - 8}px` }}
                      className="flex flex-col justify-center rounded-lg border-l-2 border-primary/40 bg-gray-50/70 pl-3 pr-2 transition hover:bg-orange-50/40 hover:border-primary"
                    >
                      <span className="text-xs font-medium text-gray-800 line-clamp-1">
                        {act.message}
                      </span>
                      <span
                        suppressHydrationWarning
                        className="text-[10px] text-gray-400 font-normal"
                      >
                        {new Date(act.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </ScrollFade>
    </Card>
  );
}
