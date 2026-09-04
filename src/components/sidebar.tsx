"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrgs } from "@/hooks/useOrgs";
import { Check, ChevronDown, LayoutDashboard, LayoutGrid, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  orgName: string;
  orgSlug: string;
}

function navClass(active: boolean) {
  return active
    ? "flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary md:gap-3"
    : "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 md:gap-3";
}

function orgSwitchHref(newSlug: string, pathname: string, currentSlug: string) {
  const rest = pathname.startsWith(`/${currentSlug}`)
    ? pathname.slice(`/${currentSlug}`.length)
    : "";

  if (rest.startsWith("/boards/") && rest !== "/boards/archived") {
    return `/${newSlug}/boards`;
  }

  return `/${newSlug}${rest}`;
}

export default function Sidebar({ orgName, orgSlug }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { orgs, currentOrg } = useOrgs();

  const name = currentOrg?.name ?? orgName;
  const slug = currentOrg?.slug ?? orgSlug;

  const overviewHref = `/${slug}`;
  const boardsHref = `/${slug}/boards`;
  const membersHref = `/${slug}/members`;

  const isOverview = pathname === overviewHref;
  const isBoards = pathname === boardsHref || pathname.startsWith(`${boardsHref}/`);
  const isMembers = pathname === membersHref || pathname.startsWith(`${membersHref}/`);

  const switchOrg = (nextSlug: string) => {
    if (nextSlug === slug) return;
    router.push(orgSwitchHref(nextSlug, pathname, slug));
  };

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-gray-200 bg-white md:w-64 md:border-b-0 md:border-r">
      <div className="flex w-full flex-1 flex-row items-center justify-between gap-4 p-4 md:flex-col md:items-stretch md:justify-start md:gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5 text-left outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary/40">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-amber-500 to-orange-500 text-lg font-bold text-white shadow-xs">
                {name[0].toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-gray-900">{name}</span>
                <span className="truncate text-xs text-gray-500">/{slug}</span>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-(--anchor-width) min-w-56">
            {orgs.map((org) => {
              const selected = org.slug === slug;
              return (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => switchOrg(org.slug)}
                  className="cursor-pointer gap-2.5 px-2 py-2"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-amber-500 to-orange-500 text-xs font-bold text-white">
                    {org.name[0].toUpperCase()}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-gray-900">{org.name}</span>
                    <span className="truncate text-xs text-gray-500">/{org.slug}</span>
                  </div>
                  {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer px-2 py-2 text-gray-600"
              onClick={() => router.push("/dashboard")}
            >
              All Organizations
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <nav className="flex flex-row gap-2 md:flex-col md:gap-1">
          <Link href={overviewHref} className={navClass(isOverview)}>
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline md:inline">Overview</span>
          </Link>
          <Link href={boardsHref} className={navClass(isBoards)}>
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline md:inline">Boards</span>
          </Link>
          <Link href={membersHref} className={navClass(isMembers)}>
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline md:inline">Members</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
