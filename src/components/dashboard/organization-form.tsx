"use client";

import { useOrgs } from "@/hooks/useOrgs";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface FormData {
  orgName: string,
  orgSlug: string
}

export default function OrganizationForm() {
  const router = useRouter();
  const { refreshOrgs } = useOrgs();
  const [formData, setFormData] = useState<FormData>({
    orgName: "",
    orgSlug: ""
  })
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateOrg(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const slug =
        formData.orgSlug.trim().toLowerCase() ||
        formData.orgName.trim().toLowerCase().replace(/\s+/g, "-");

      const res = await authClient.organization.create({
        name: formData.orgName,
        slug: slug,
      });

      if (res.error) {
        setError(res.error.message || "Failed to create organization");
      } else {
        await refreshOrgs();
        router.push(`/${slug}/boards`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-gray-200 shadow-md h-75 flex flex-col pb-0">
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
        <CardDescription>Collaborate with your team on custom boards</CardDescription>
      </CardHeader>
      <form className="flex flex-1 flex-col" onSubmit={handleCreateOrg}>
        <CardContent className="flex-1 space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              type="text"
              placeholder="GeekyAnts"
              value={formData.orgName}
              onChange={(e) => {
                setFormData({
                  orgName: e.target.value,
                  orgSlug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                });
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgSlug">Slug (URL endpoint)</Label>
            <Input
              id="orgSlug"
              type="text"
              placeholder="geekyants"
              value={formData.orgSlug}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  orgSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "")
                })
              }
              required
            />
          </div>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Organization"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
