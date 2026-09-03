import { Card, CardTitle } from "@/components/ui/card";

interface StatsProps {
  boardsCount: number;
  tasksCount: number;
  overdueCount: number;
}

export function DashboardStats({ boardsCount, tasksCount, overdueCount }: StatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 font-sans">
      <Card size="sm" className="flex-row items-center justify-between border-gray-200 px-3 py-2 shadow-sm">
        <CardTitle className="text-xs font-semibold text-gray-500">Active Boards</CardTitle>
        <span className="text-lg font-bold text-gray-900">{boardsCount}</span>
      </Card>

      <Card size="sm" className="flex-row items-center justify-between border-gray-200 px-3 py-2 shadow-sm">
        <CardTitle className="text-xs font-semibold text-gray-500">Active Tasks</CardTitle>
        <span className="text-lg font-bold text-gray-900">{tasksCount}</span>
      </Card>

      <Card size="sm" className="flex-row items-center justify-between border-gray-200 bg-red-50/50 px-3 py-2 shadow-sm">
        <CardTitle className="text-xs font-semibold text-red-600">Overdue Tasks</CardTitle>
        <span className="text-lg font-bold text-red-600">{overdueCount}</span>
      </Card>
    </div>
  );
}