import { LayoutDashboard, Users } from "lucide-react";

export function OrgLayoutFallback() {
  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-gray-50 md:flex-row">
      <aside className="flex w-full shrink-0 flex-col justify-between border-b border-gray-200 bg-white md:w-64 md:flex-row md:border-b-0 md:border-r">
        <div className="flex w-full flex-row items-center justify-between gap-4 p-4 md:flex-col md:items-stretch md:justify-start md:gap-6">
          <div className="flex shrink-0 items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-gray-200" />
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
            </div>
          </div>

          <nav className="flex flex-row gap-2 md:flex-col md:gap-1">
            <span className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 md:gap-3">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline md:inline">Boards</span>
            </span>
            <span className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 md:gap-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline md:inline">Members</span>
            </span>
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4" />
    </div>
  );
}
