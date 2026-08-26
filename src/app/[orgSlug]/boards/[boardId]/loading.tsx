export default function BoardPageLoading() {
  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 p-4 md:p-6 animate-pulse font-sans">
      {/* 1. Top Section: Header, Search & 4 Stat Cards */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Top Row: Title + Add List Button */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-7 w-32 bg-gray-200 rounded-md" />
            <div className="h-4 w-4 bg-gray-200 rounded-sm" />
          </div>
          <div className="h-8 w-24 bg-gray-100 rounded-md border border-gray-200" />
        </div>

        {/* Middle Row: Search Bar */}
        <div className="pt-4 pb-1">
          <div className="h-8 w-48 sm:w-64 bg-gray-100 rounded-md border border-gray-200/80" />
        </div>

        {/* Bottom Row: 4 Metric Cards (Lists, Tasks, Overdue, Organization) */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Lists */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
            <div className="h-3 w-10 bg-gray-200 rounded" />
            <div className="h-6 w-8 bg-gray-300 rounded" />
          </div>

          {/* Tasks */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
            <div className="h-3 w-12 bg-gray-200 rounded" />
            <div className="h-6 w-8 bg-gray-300 rounded" />
          </div>

          {/* Overdue */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
            <div className="h-3 w-14 bg-gray-200 rounded" />
            <div className="h-6 w-8 bg-red-100 rounded" />
          </div>

          {/* Organization */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-5 w-28 bg-gray-300 rounded" />
          </div>
        </div>
      </section>

      {/* 2. Bottom Section: Kanban Columns Skeleton */}
      <section className="min-h-112.5 flex-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex items-start gap-4 overflow-x-auto pb-4 pt-1">
          {[1, 2, 3].map((col) => (
            <div
              key={col}
              className="w-76 shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-6 bg-gray-200 rounded-full" />
              </div>

              {/* Column Cards */}
              <div className="space-y-2 mt-3">
                {[1, 2].map((card) => (
                  <div
                    key={card}
                    className="h-20 bg-white rounded-lg border border-gray-200 p-3 flex flex-col justify-between shadow-xs"
                  >
                    <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-16 bg-gray-100 rounded" />
                      <div className="h-4 w-8 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
