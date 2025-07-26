import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="h-full overflow-hidden">
              {/* Image skeleton */}
              <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-200 animate-pulse" />
              <CardHeader className="pb-3 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="h-5 w-full bg-gray-200 animate-pulse rounded" />
              </CardHeader>
              <CardContent className="pt-0 p-4 sm:p-6">
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
