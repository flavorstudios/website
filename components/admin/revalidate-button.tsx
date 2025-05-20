"use client"

import { useState } from "react"
import { revalidateBlog, revalidateHome, revalidateWatch } from "@/app/actions/revalidate"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function RevalidateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPath, setSelectedPath] = useState("blog")

  const handleRevalidate = async () => {
    setIsLoading(true)
    try {
      if (selectedPath === "blog") {
        await revalidateBlog()
      } else if (selectedPath === "watch") {
        await revalidateWatch()
      } else if (selectedPath === "home") {
        await revalidateHome()
      }

      toast({
        title: "Cache cleared successfully",
        description: `The ${selectedPath} page cache has been revalidated.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to revalidate:", error)
      toast({
        title: "Failed to clear cache",
        description: "There was an error revalidating the cache. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedPath} onValueChange={setSelectedPath}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select path" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blog">Blog Page</SelectItem>
            <SelectItem value="watch">Watch Page</SelectItem>
            <SelectItem value="home">Home Page</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleRevalidate} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Revalidating...
            </>
          ) : (
            `Revalidate ${selectedPath} Cache`
          )}
        </Button>
      </div>
      <Card className="p-4 bg-muted/50 text-sm">
        <p>
          Revalidating will clear the cache for the selected page, ensuring visitors see the most recent content. This
          is useful after publishing new content or making updates.
        </p>
      </Card>
    </div>
  )
}
