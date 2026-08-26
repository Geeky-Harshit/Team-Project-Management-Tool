export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 container mx-auto p-6 max-w-5xl animate-pulse">
        {/* Title Skeleton: "Welcome, User" */}
        <div className="h-9 w-64 bg-gray-200 rounded-lg mb-8" />

        {/* 2-Column Grid matching OrganizationList and OrganizationForm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Card: Organization List Skeleton */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-75 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-6 w-44 bg-gray-200 rounded-md" />
              <div className="h-4 w-60 bg-gray-100 rounded-md" />
            </div>
            <div className="space-y-3 my-auto">
              <div className="h-12 w-full bg-gray-50 rounded-lg border border-gray-100" />
              <div className="h-12 w-full bg-gray-50 rounded-lg border border-gray-100" />
            </div>
            <div className="h-4 w-28 bg-gray-100 rounded-md" />
          </div>

          {/* Right Card: Organization Form Skeleton */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-75 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-6 w-44 bg-gray-200 rounded-md" />
              <div className="h-4 w-64 bg-gray-100 rounded-md" />
            </div>
            <div className="space-y-4 my-auto">
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 bg-gray-200 rounded" />
                <div className="h-9 w-full bg-gray-50 rounded-md border border-gray-200/60" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 bg-gray-200 rounded" />
                <div className="h-9 w-full bg-gray-50 rounded-md border border-gray-200/60" />
              </div>
            </div>
            <div className="h-9 w-full bg-gray-200 rounded-md" />
          </div>
        </div>
      </main>
    </div>
  );
}
