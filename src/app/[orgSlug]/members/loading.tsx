export default function MembersLoading() {
  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-md" />
          <div className="h-4 w-72 bg-gray-100 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-gray-200 rounded-md" />
                <div className="h-3 w-48 bg-gray-100 rounded-md" />
              </div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
