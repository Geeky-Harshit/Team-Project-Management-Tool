import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function MemberRowFallback({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="h-4 w-32 rounded-md bg-gray-200" />
          <div className="h-3 w-44 rounded-md bg-gray-100" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="h-6 w-16 rounded bg-gray-100" />
        {isAdmin && <div className="h-8 w-8 rounded-md bg-gray-100" />}
      </div>
    </div>
  );
}

export function MembersPageFallback({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <div className="mx-auto flex flex-col gap-6 font-sans animate-pulse">
      <div>
        <div className="h-7 w-28 rounded-md bg-gray-200" />
        <div className="mt-2 h-4 w-64 rounded-md bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
        <div className={isAdmin ? "md:col-span-2" : "md:col-span-3"}>
          <Card className="border-gray-200 shadow-sm font-sans">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                <div className="h-5 w-36 rounded-md bg-gray-200" />
              </CardTitle>
              <CardDescription>
                <div className="h-3.5 w-52 rounded-md bg-gray-100" />
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              <div className="space-y-0 px-4 py-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <MemberRowFallback key={i} isAdmin={isAdmin} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-6">
            <Card className="border-gray-200 shadow-sm font-sans">
              <CardHeader className="pb-3">
                <div className="h-5 w-32 rounded-md bg-gray-200" />
                <div className="h-3.5 w-48 rounded-md bg-gray-100" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                  <div className="h-9 w-full rounded-md bg-gray-100" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded bg-gray-200" />
                  <div className="h-9 w-full rounded-md bg-gray-100" />
                </div>
                <div className="h-9 w-full rounded-md bg-gray-200" />
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm font-sans">
              <CardHeader className="pb-3">
                <div className="h-5 w-40 rounded-md bg-gray-200" />
                <div className="h-3.5 w-56 rounded-md bg-gray-100" />
              </CardHeader>
              <CardContent className="divide-y divide-gray-100">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <div className="h-4 w-36 rounded-md bg-gray-200" />
                      <div className="h-3 w-20 rounded bg-gray-100" />
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="h-5 w-16 rounded bg-gray-100" />
                      <div className="h-7 w-16 rounded-md bg-gray-100" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
