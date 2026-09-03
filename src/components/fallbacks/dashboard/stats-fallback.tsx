export function StatsFallback() {
  return (
    <div className="grid grid-cols-3 gap-3 font-sans animate-pulse">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="mt-1.5 h-7 w-10 rounded bg-gray-200" />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="mt-1.5 h-7 w-10 rounded bg-gray-200" />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="h-3 w-24 rounded bg-red-100" />
        <div className="mt-1.5 h-7 w-10 rounded bg-red-100" />
      </div>
    </div>
  );
}
