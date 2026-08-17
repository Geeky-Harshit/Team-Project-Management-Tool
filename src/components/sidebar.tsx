import Link from "next/link";
import { LayoutDashboard, Users } from "lucide-react";

interface SidebarProps {
  orgName: string;
  orgSlug: string;
}

export default function Sidebar({ orgName, orgSlug }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0">
      <div className="p-4 flex flex-col gap-6">
        {/* Org Header */}
        <Link href={`/${orgSlug}`}>
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
            <div className="h-9 w-9 rounded-md bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {orgName[0].toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900 truncate text-sm">{orgName}</span>
              <span className="text-xs text-gray-500 truncate">/{orgSlug}</span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          <Link
            href={`/${orgSlug}/boards`}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-orange-50/30 transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            Boards
          </Link>
          <Link
            href={`/${orgSlug}/members`}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-orange-50/30 transition-all"
          >
            <Users className="h-4 w-4" />
            Members
          </Link>
        </nav>
      </div>
    </aside>
  );
}
