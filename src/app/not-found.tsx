import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-6">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          The page you are looking for does not exist or was moved.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}