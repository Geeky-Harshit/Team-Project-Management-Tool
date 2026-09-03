import { Card } from "@/components/ui/card";

function BoardCardFallback() {
  return (
    <Card className="flex h-44 flex-col justify-between border-gray-200 p-5 shadow-xs">
      <div>
        <div className="h-5 w-28 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="h-3 w-28 rounded bg-gray-100" />
        <div className="h-5 w-16 rounded-full bg-gray-100" />
      </div>
    </Card>
  );
}

export function BoardsGridFallback({ canCreate = false }: { canCreate?: boolean }) {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="mt-1.5 h-7 w-10 rounded bg-gray-200" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="mt-1.5 h-7 w-10 rounded bg-gray-200" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="mt-1.5 h-7 w-10 rounded bg-red-100" />
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <div className="h-6 w-28 rounded bg-gray-200" />
          <div className="mt-1 h-3 w-32 rounded bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {canCreate && (
            <Card className="flex h-44 flex-col items-center justify-center border-2 border-dashed border-gray-300 shadow-none">
              <div className="h-6 w-6 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-32 rounded bg-gray-100" />
            </Card>
          )}
          {(canCreate ? [1, 2, 3] : [1, 2, 3, 4]).map((i) => (
            <BoardCardFallback key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
