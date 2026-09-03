import { BoardsGridLive } from "@/components/board/boards-grid-live";
import { BoardsGridFallback } from "@/components/fallbacks/boards/boards-grid-fallback";
import { canEditCards, canManageOrg } from "@/lib/auth/permissions";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { Archive } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { orgSlug } = await params;
  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) return { title: "Boards Not Found" };

  return {
    title: `${org.name} | Boards`,
    description: `Kanban boards and workflows for ${org.name}.`,
  };
}

async function BoardsPageInner({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) notFound();

  const { role } = await validateOrgAccess(org.id, "viewer", org);
  const canManage = canManageOrg(role);
  const canCreate = canEditCards(role);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-8 font-sans">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Boards</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage planning spaces and workflows for {org.name}
            </p>
          </div>
          {canManage && (
            <Link
              href={`/${orgSlug}/boards/archived`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50"
            >
              <Archive className="h-4 w-4" />
              Archived Boards
            </Link>
          )}
        </div>

        <Suspense fallback={<BoardsGridFallback canCreate={canCreate} />}>
          <BoardsGridLive
            orgId={org.id}
            orgSlug={orgSlug}
            canCreate={canCreate}
          />
        </Suspense>
      </section>
    </div>
  );
}

export default function BoardsPage({ params }: PageProps) {
  return (
    <BoardsPageInner params={params} />
  );
}
