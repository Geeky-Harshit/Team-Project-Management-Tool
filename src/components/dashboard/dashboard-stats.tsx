import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsProps {
  boardsCount: number;
  tasksCount: number;
  overdueCount: number;
}

export function DashboardStats({ boardsCount, tasksCount, overdueCount }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-500">Active Boards</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold text-gray-900">{boardsCount}</span>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-500">Active Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold text-gray-900">{tasksCount}</span>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-red-50/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-red-600">Overdue Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold text-red-600">{overdueCount}</span>
        </CardContent>
      </Card>
    </div>
  );
}