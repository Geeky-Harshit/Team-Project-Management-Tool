"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Role } from "@/types";
import { UserPlus } from "lucide-react";
import { useState } from "react";

interface InviteFormProps {
  orgId: string;
  onInviteSuccess: () => void;
}

export function InviteForm({ orgId, onInviteSuccess }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, email: email.trim(), role }),
      });

      const data = (await res.json()) as { error?: string };
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess("Invitation sent successfully!");
        setEmail("");
        onInviteSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm font-sans">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          Invite Member
        </CardTitle>
        <CardDescription>Add collaborators to this workspace</CardDescription>
      </CardHeader>
      <form onSubmit={handleInvite}>
        <CardContent className="space-y-4">
          {error && <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-md font-medium">{error}</div>}
          {success && <div className="text-xs text-green-600 bg-green-50 p-2.5 rounded-md font-medium">{success}</div>}

          <div className="space-y-1.5">
            <label htmlFor="invite-email" className="text-xs font-semibold text-gray-700">Email Address</label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-9 text-xs focus-visible:ring-primary font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="invite-role" className="text-xs font-semibold text-gray-700">Workspace Role</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full text-xs border border-gray-200 rounded-md p-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
            >
              <option value="member">Member (Can edit lists & cards)</option>
              <option value="admin">Admin (Manage members and boards)</option>
              <option value="viewer">Viewer (Read-only access)</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-xs font-semibold h-9 font-sans"
          >
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}