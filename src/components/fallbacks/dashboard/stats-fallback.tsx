import { Card } from "@/components/ui/card";

export function StatsFallback() {
  return (
    <div className="grid grid-cols-3 gap-1.5 font-sans animate-pulse">
      <Card size="sm" className="flex-row items-center justify-between border-gray-200 px-3 py-2 shadow-sm">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="h-5 w-8 rounded bg-gray-200" />
      </Card>
      <Card size="sm" className="flex-row items-center justify-between border-gray-200 px-3 py-2 shadow-sm">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="h-5 w-8 rounded bg-gray-200" />
      </Card>
      <Card size="sm" className="flex-row items-center justify-between border-gray-200 bg-red-50/50 px-3 py-2 shadow-sm">
        <div className="h-3 w-24 rounded bg-red-100" />
        <div className="h-5 w-8 rounded bg-red-100" />
      </Card>
    </div>
  );
}
