import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Skeleton */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>

          <div className="h-12 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-6"></div>

          <div className="flex items-center gap-4">
            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </header>

        {/* Featured Image Skeleton */}
        <div className="h-64 md:h-96 bg-gray-200 animate-pulse rounded-lg mb-8"></div>

        {/* Content Skeleton */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </CardContent>
        </Card>

        {/* Tags Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-14 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
