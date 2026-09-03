import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OverdueFallback() {
  return (
    <Card className="h-full min-h-0 animate-pulse rounded-xl border border-gray-200 font-sans shadow-xs">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base font-semibold">
          <div className="h-5 w-32 rounded-md bg-gray-200" />
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-3 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0"
          >
            <div className="h-3.5 w-40 rounded bg-gray-200" />
            <div className="h-5 w-20 rounded bg-red-50" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
