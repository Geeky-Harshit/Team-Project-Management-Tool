"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InviteError({ error }: { error: string }) {
  return (
    <Card className="max-w-md w-full border-red-100 bg-red-50/20 shadow-lg font-sans">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-red-600">Invitation Error</CardTitle>
        <CardDescription>We couldn&apos;t process this link</CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-red-600 bg-red-50 p-4 rounded-md mx-6 mb-6 font-medium">
        {error}
      </CardContent>
    </Card>
  );
}