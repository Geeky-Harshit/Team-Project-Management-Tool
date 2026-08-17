function ColumnSkeleton() {
  return (
    <div className="w-76 shrink-0 animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="h-5 w-32 rounded bg-gray-200" />
      <div className="mt-3 space-y-2">
        <div className="h-16 rounded-lg bg-white border border-gray-200" />
        <div className="h-16 rounded-lg bg-white border border-gray-200" />
        <div className="h-16 rounded-lg bg-white border border-gray-200" />
      </div>
      <div className="mt-3 h-9 rounded bg-white border border-gray-200" />
    </div>
  );
}

export default function BoardLoading() {
  return (
    <div className="mx-auto flex h-full w-full max-w-375 flex-col gap-6 p-4 md:p-6">
      <section className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="h-8 w-72 rounded bg-gray-200" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="h-16 rounded-lg bg-gray-100" />
          <div className="h-16 rounded-lg bg-gray-100" />
          <div className="h-16 rounded-lg bg-gray-100" />
          <div className="h-16 rounded-lg bg-gray-100" />
        </div>
      </section>

      <section className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex gap-4 overflow-x-auto pb-2">
          <ColumnSkeleton />
          <ColumnSkeleton />
          <ColumnSkeleton />
        </div>
      </section>
    </div>
  );
}