"use client";

import { AutoHideScrollbar } from "@/components/auto-hide-scrollbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@/types";
import { Activity as ActivityIcon, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface WorkspaceActivityFeedProps {
  initialActivities: Activity[];
  orgId: string;
}

const ITEM_HEIGHT = 56;
const OVERSCAN = 5;

export function WorkspaceActivityFeed({
  initialActivities = [],
  orgId,
}: WorkspaceActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [cursor, setCursor] = useState<string | null>(
    initialActivities && initialActivities.length >= 30
      ? initialActivities[initialActivities.length - 1]?.createdAt
      : null
  );
  const [hasMore, setHasMore] = useState(
    Boolean(initialActivities && initialActivities.length >= 30)
  );
  const [loadingMore, setLoadingMore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(400);

  const totalHeight = (activities?.length || 0) * ITEM_HEIGHT;

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const res = await fetch(`/api/activity?orgId=${orgId}&cursor=${encodeURIComponent(cursor)}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setActivities((prev) => [...prev, ...data.activities]);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Failed to load more activities:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, hasMore, orgId]);
    const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const currentScrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;
    const scrollHeight = el.scrollHeight;

    setScrollTop(currentScrollTop);
    setViewportHeight(clientHeight || 400);

    // Trigger loadMore when user scrolls within 150px of the bottom
    if (currentScrollTop + clientHeight >= scrollHeight - 150) {
      loadMore();
    }
  }, [loadMore]);

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
    <Card className="flex h-full min-h-0 flex-col border-gray-200 font-sans shadow-sm">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between border-b border-gray-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ActivityIcon className="h-4 w-4 text-primary" />
          Workspace Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="relative min-h-0 flex-1 p-0">
        <AutoHideScrollbar
          ref={containerRef}
          className="h-full"
          contentClassName="h-full px-4 py-2"
          onScroll={updateScrollState}
        >
            {activities.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-xs text-gray-500">No recent workspace activity.</p>
              </div>
            ) : (
              <div
                style={{ height: `${totalHeight + (loadingMore ? 40 : 0)}px`, position: "relative" }}
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
            {loadingMore && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
        </AutoHideScrollbar>
      </CardContent>
    </Card>
  );
}