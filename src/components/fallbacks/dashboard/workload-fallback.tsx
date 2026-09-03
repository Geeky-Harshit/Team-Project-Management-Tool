import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkloadFallback() {
  return (
    <Card className="h-full min-h-0 animate-pulse rounded-xl border border-gray-200 font-sans shadow-xs">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base font-semibold">
          <div className="h-5 w-44 rounded-md bg-gray-200" />
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-3 overflow-hidden px-4 py-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-1">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="h-7 w-7 shrink-0 rounded-full bg-orange-100" />
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="h-3.5 w-24 rounded bg-gray-200" />
                <div className="h-3 w-32 rounded bg-gray-100" />
              </div>
            </div>
            <div className="h-5 w-16 shrink-0 rounded-full bg-gray-100" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
