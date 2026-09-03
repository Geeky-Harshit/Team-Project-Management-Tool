import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InvitePageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <Card className="w-full max-w-md border-gray-200 font-sans shadow-lg animate-pulse">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <div className="mx-auto h-7 w-40 rounded-md bg-gray-200" />
          </CardTitle>
          <CardDescription>
            <div className="mx-auto mt-2 h-4 w-56 rounded-md bg-gray-100" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="h-4 w-full max-w-xs rounded bg-gray-100" />
          <div className="h-4 w-3/4 rounded bg-gray-100" />
          <div className="mt-2 h-10 w-full rounded-md bg-gray-200" />
        </CardContent>
      </Card>
    </div>
  );
}
