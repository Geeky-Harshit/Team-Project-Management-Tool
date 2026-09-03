export function BoardPageFallback() {
  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 p-4 md:p-6 font-sans animate-pulse">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="h-3 w-10 rounded bg-gray-200" />
            <div className="h-6 w-8 rounded bg-gray-300" />
          </div>
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="h-3 w-12 rounded bg-gray-200" />
            <div className="h-6 w-8 rounded bg-gray-300" />
          </div>
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="h-3 w-14 rounded bg-gray-200" />
            <div className="h-6 w-8 rounded bg-red-100" />
          </div>
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-5 w-28 rounded bg-gray-300" />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="h-7 w-40 rounded-md bg-gray-200" />
            <div className="h-8 w-24 rounded-md bg-gray-100" />
          </div>
          <div className="h-8 w-48 rounded-md bg-gray-100 sm:w-64" />
        </div>

        <div className="mt-6 min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-start gap-4 overflow-x-auto pb-4 pt-1">
            {[1, 2, 3].map((col) => (
              <div
                key={col}
                className="w-76 shrink-0 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-4 w-6 rounded-full bg-gray-200" />
                </div>
                <div className="mt-3 space-y-2">
                  {[1, 2].map((card) => (
                    <div
                      key={card}
                      className="flex h-20 flex-col justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-xs"
                    >
                      <div className="h-3.5 w-3/4 rounded bg-gray-200" />
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-16 rounded bg-gray-100" />
                        <div className="h-4 w-8 rounded-full bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
