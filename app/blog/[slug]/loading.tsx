export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-6"></div>

        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-64 md:h-96 bg-gray-200 animate-pulse"></div>

          <div className="p-6 md:p-8">
            <div className="flex gap-4 mb-6">
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>

            <div className="h-10 bg-gray-200 animate-pulse rounded mb-6"></div>

            <div className="space-y-4">
              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
