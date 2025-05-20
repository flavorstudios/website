import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RevalidateButton from "./revalidate-button"

export default function CacheManager() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cache Management</CardTitle>
        <CardDescription>
          Clear the cache for specific sections of the website to ensure content is up-to-date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RevalidateButton />
      </CardContent>
    </Card>
  )
}
