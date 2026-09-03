import { ArchivedBoardsFallback } from "@/components/fallbacks/boards/archived-boards-fallback";

export default function ArchivedBoardsLoading() {
  return (
    <div className="flex w-full flex-col gap-6 font-sans">
      <div className="flex flex-col gap-1 animate-pulse">
        <div className="mb-1 h-3.5 w-36 rounded bg-gray-200" />
        <div className="h-3 w-16 rounded bg-orange-100" />
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-96 max-w-full rounded bg-gray-100" />
      </div>
      <ArchivedBoardsFallback />
    </div>
  );
}
