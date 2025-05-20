import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Share2 } from "lucide-react"

export default function LoadingCard() {
  return (
    <Card className="overflow-hidden border border-primary/20">
      <div className="rounded-lg">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2 text-primary" />
            Shared Content
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Loading shared content...</h3>
            <Skeleton className="h-6 w-full" />
          </div>
          <div>
            <Skeleton className="h-20 w-full" />
          </div>
          <div>
            <Skeleton className="h-6 w-3/4" />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
