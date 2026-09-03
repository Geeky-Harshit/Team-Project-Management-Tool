interface StatsProps {
  boardsCount: number;
  tasksCount: number;
  overdueCount: number;
}

export function DashboardStats({ boardsCount, tasksCount, overdueCount }: StatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 font-sans">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Active Boards</p>
        <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">{boardsCount}</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Active Tasks</p>
        <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">{tasksCount}</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Overdue Tasks</p>
        <p className="mt-1.5 text-2xl font-bold tracking-tight text-red-600">{overdueCount}</p>
      </div>
    </div>
  );
}
