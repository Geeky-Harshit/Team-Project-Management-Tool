import Link from "next/link";

export default function OrgNotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Workspace Not Found
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Organization or board not found
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          This resource may not exist or you may not have access.
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