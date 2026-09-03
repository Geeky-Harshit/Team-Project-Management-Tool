import { BoardsGridFallback } from "@/components/fallbacks/boards/boards-grid-fallback";

export default function BoardsLoading() {
  return (
    <div className="flex w-full flex-col gap-6 font-sans">
      <div className="flex shrink-0 flex-col gap-1 animate-pulse">
        <div className="h-3 w-20 rounded bg-orange-100" />
        <div className="mt-1 h-8 w-28 rounded bg-gray-200" />
        <div className="mt-1 h-4 w-72 rounded bg-gray-100" />
      </div>
      <BoardsGridFallback />
    </div>
  );
}
