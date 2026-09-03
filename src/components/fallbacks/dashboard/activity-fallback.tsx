import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityFallback() {
  return (
    <Card className="flex h-full min-h-0 flex-col animate-pulse border-gray-200 font-sans shadow-sm">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between border-b border-gray-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="h-4 w-4 rounded bg-gray-200" />
          <div className="h-5 w-40 rounded-md bg-gray-200" />
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-2 overflow-hidden px-4 py-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex h-12 flex-col justify-center rounded-lg border-l-2 border-gray-200 bg-gray-50/70 pl-3 pr-2"
          >
            <div className="h-3.5 w-3/4 rounded bg-gray-200" />
            <div className="mt-1.5 h-2.5 w-28 rounded bg-gray-100" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
