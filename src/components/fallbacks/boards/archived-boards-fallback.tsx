import { Card } from "@/components/ui/card";

export function ArchivedBoardsFallback() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className="flex flex-col justify-between border-gray-200 p-5 shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="h-5 w-16 rounded-full bg-gray-200" />
              <div className="h-3 w-16 rounded bg-gray-100" />
            </div>
            <div className="mt-3 h-5 w-28 rounded bg-gray-200" />
            <div className="mt-2 h-3.5 w-24 rounded bg-gray-100" />
          </div>
          <div className="mt-5 flex items-center justify-end border-t border-gray-100 pt-4">
            <div className="h-8 w-20 rounded-md bg-gray-100" />
          </div>
        </Card>
      ))}
    </div>
  );
}
