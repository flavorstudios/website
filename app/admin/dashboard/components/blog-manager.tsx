"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { revalidateBlogAndAdminDashboard } from "@/app/admin/actions"

export const BlogManager = () => {
  const [isRevalidating, setIsRevalidating] = useState(false)

  const handleRevalidateBlog = async () => {
    setIsRevalidating(true)
    try {
      const result = await revalidateBlogAndAdminDashboard()
      // Use toast or some feedback mechanism if available
      alert(result.message) // Simple alert for now
    } catch (error) {
      console.error("Failed to revalidate blog:", error)
      alert("Failed to revalidate blog section.")
    } finally {
      setIsRevalidating(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Blog Management</h2>
        <div className="space-x-2">
          <Button onClick={handleRevalidateBlog} disabled={isRevalidating} variant="outline" size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRevalidating ? "animate-spin" : ""}`} />
            {isRevalidating ? "Revalidating..." : "Revalidate Blog Section"}
          </Button>
          <Button>Create New Post</Button>
        </div>
      </div>
      {/* Rest of the blog manager component */}
      <div>
        {/* Example content - replace with actual blog management UI */}
        <p>This is where the blog management UI will go.</p>
      </div>
    </div>
  )
}
