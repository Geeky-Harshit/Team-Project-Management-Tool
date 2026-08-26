export default function OrgDashboardLoading() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <div className="h-4 w-44 bg-gray-100 rounded-md" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-24 bg-gray-100 rounded-2xl border border-gray-200/60" />
        <div className="h-24 bg-gray-100 rounded-2xl border border-gray-200/60" />
        <div className="h-24 bg-gray-100 rounded-2xl border border-gray-200/60" />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-100 rounded-2xl border border-gray-200/60" />
        <div className="h-80 bg-gray-100 rounded-2xl border border-gray-200/60" />
      </div>
    </div>
  );
}