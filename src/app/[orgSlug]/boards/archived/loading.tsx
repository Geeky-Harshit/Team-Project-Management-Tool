export default function ArchivedBoardsLoading() {
    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-8 animate-pulse font-sans">
            {/* 1. Header Section */}
            <div className="space-y-2">
                {/* Back Link */}
                <div className="h-4 w-36 bg-gray-200 rounded" />
                {/* Title */}
                <div className="h-8 w-52 bg-gray-200 rounded-lg" />
                {/* Subtitle */}
                <div className="h-4 w-full max-w-xl bg-gray-100 rounded" />
            </div>

            {/* 2. Archived Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <div>
                            {/* Badge + Date */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="h-5 w-16 bg-gray-200 rounded-full" />
                                <div className="h-3 w-16 bg-gray-100 rounded" />
                            </div>

                            {/* Board Title */}
                            <div className="mt-3 h-5 w-28 bg-gray-200 rounded" />

                            {/* List & Task Count */}
                            <div className="mt-2 h-3.5 w-24 bg-gray-100 rounded" />
                        </div>

                        {/* Restore Button Placeholder */}
                        <div className="mt-5 flex items-center justify-end border-t border-gray-100 pt-4">
                            <div className="h-8 w-20 bg-gray-100 rounded-md border border-gray-200" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
