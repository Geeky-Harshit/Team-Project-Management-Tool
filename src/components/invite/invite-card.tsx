"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@/types";

interface InviteCardProps {
  organizationName: string;
  role: Role;
  accepting: boolean;
  onAccept: () => void;
  isLoggedIn: boolean;
}

export function InviteCard({
  organizationName,
  role,
  accepting,
  onAccept,
  isLoggedIn,
}: InviteCardProps) {
  return (
    <Card className="max-w-md w-full border-gray-200 shadow-lg font-sans">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">You&apos;re Invited!</CardTitle>
        <CardDescription>Join team collaboration workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col items-center">
        <p className="text-sm text-gray-600 text-center">
          You have been invited to join{" "}
          <strong className="text-gray-900">{organizationName}</strong> as a{" "}
          <span className="font-semibold text-primary">{role}</span>.
        </p>
        <Button
          onClick={onAccept}
          disabled={accepting}
          className="w-full bg-primary hover:bg-primary/90 mt-2 font-semibold text-sm h-10"
        >
          {accepting ? "Joining..." : isLoggedIn ? "Accept & Join" : "Log In to Accept"}
        </Button>
      </CardContent>
    </Card>
  );
}