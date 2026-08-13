"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useOrgs } from "@/context/org-context";

export default function OrganizationList() {
  const { orgs, loading, error } = useOrgs();
  const listRef = useRef<HTMLDivElement>(null);
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);

  const checkScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;

      // Show top indicator if user has scrolled down
      setShowTopIndicator(scrollTop > 0);

      // Show bottom indicator if there is scrollable content remaining at the bottom
      setShowBottomIndicator(scrollTop + clientHeight < scrollHeight - 1);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [orgs, loading]);

  useEffect(() => {
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  return (
    <Card className="border-gray-200 shadow-md h-[300px] flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Your Organizations</CardTitle>
        <CardDescription>Select an organization to manage your boards</CardDescription>
      </CardHeader>
      <div className="flex-1 relative overflow-hidden flex flex-col">

        {/* Top fade/indicator */}
        {showTopIndicator && (
          <div className="absolute top-0 left-0 right-0 h-10 bg-linear-to-b from-white via-white/80 to-transparent pointer-events-none flex items-start justify-center z-10">
            <ChevronsUp className="h-4 w-4 text-gray-400 animate-bounce" />
          </div>
        )}

        <CardContent
          ref={listRef}
          onScroll={checkScroll}
          className="space-y-4 flex-1 overflow-y-auto pb-8"
        >
          {loading ? (
            <p className="text-gray-500 text-sm">Loading organizations...</p>
          ) : error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : orgs.length === 0 ? (
            <p className="text-gray-500 text-sm">You aren&apos;t a member of any organization yet.</p>
          ) : (
            <div className="space-y-2">
              {orgs.map((org) => (
                <Link
                  key={org.id}
                  href={`/${org.slug}/boards`}
                  className="block p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-orange-50/20 transition duration-150"
                >
                  <div className="font-semibold text-gray-900">{org.name}</div>
                  <div className="text-xs text-gray-500">/{org.slug}</div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>

        {/* Bottom fade/indicator */}
        {showBottomIndicator && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-white via-white/80 to-transparent pointer-events-none flex items-end justify-center pb-1 z-10">
            <ChevronsDown className="h-4 w-4 text-gray-400 animate-bounce" />
          </div>
        )}
      </div>
    </Card>
  );
}
