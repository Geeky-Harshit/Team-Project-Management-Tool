import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardPageFallback({
  userName,
}: {
  userName?: string | null;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="container mx-auto max-w-5xl flex-1 p-6">
        {userName ? (
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Welcome, {userName}
          </h1>
        ) : (
          <div className="mb-8 h-9 w-64 animate-pulse rounded-lg bg-gray-200" />
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="flex h-75 flex-col overflow-hidden border-gray-200 shadow-md animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle>
                <div className="h-6 w-44 rounded-md bg-gray-200" />
              </CardTitle>
              <CardDescription>
                <div className="h-4 w-60 rounded-md bg-gray-100" />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              <div className="h-12 w-full rounded-lg border border-gray-100 bg-gray-50" />
              <div className="h-12 w-full rounded-lg border border-gray-100 bg-gray-50" />
            </CardContent>
          </Card>

          <Card className="flex h-75 flex-col border-gray-200 pb-0 shadow-md animate-pulse">
            <CardHeader>
              <CardTitle>
                <div className="h-6 w-52 rounded-md bg-gray-200" />
              </CardTitle>
              <CardDescription>
                <div className="h-4 w-64 rounded-md bg-gray-100" />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="h-3.5 w-32 rounded bg-gray-200" />
                <div className="h-9 w-full rounded-md bg-gray-50" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-36 rounded bg-gray-200" />
                <div className="h-9 w-full rounded-md bg-gray-50" />
              </div>
            </CardContent>
            <CardFooter className="mt-auto">
              <div className="h-9 w-full rounded-md bg-gray-200" />
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
