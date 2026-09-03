import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 font-sans animate-pulse md:grid-cols-3">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-500">
            <div className="h-4 w-24 rounded bg-gray-200" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-12 rounded-md bg-gray-200" />
        </CardContent>
      </Card>
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-500">
            <div className="h-4 w-24 rounded bg-gray-200" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-12 rounded-md bg-gray-200" />
        </CardContent>
      </Card>
      <Card className="border-gray-200 bg-red-50/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-red-600">
            <div className="h-4 w-28 rounded bg-red-100" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-12 rounded-md bg-red-100" />
        </CardContent>
      </Card>
    </div>
  );
}
