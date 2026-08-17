function SkeletonCard() {
  return (
    <div className="h-44 animate-pulse rounded-xl border border-gray-200 bg-white p-4">
      <div className="h-5 w-16 rounded bg-gray-200" />
      <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
      <div className="mt-8 h-3 w-24 rounded bg-gray-200" />
    </div>
  );
}

export default function BoardsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-8">
      <section className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="mt-3 h-8 w-52 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-20 rounded-xl bg-gray-100" />
          <div className="h-20 rounded-xl bg-gray-100" />
          <div className="h-20 rounded-xl bg-gray-100" />
        </div>
      </section>

      <section>
        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}