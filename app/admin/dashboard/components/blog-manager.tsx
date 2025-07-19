"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"      // <-- Added import
import { revalidateBlogAndAdminDashboard } from "@/app/admin/actions"

export const BlogManager = () => {
  const [isRevalidating, setIsRevalidating] = useState(false)
  const router = useRouter()

  const handleRevalidateBlog = async () => {
    setIsRevalidating(true)
    try {
      const result = await revalidateBlogAndAdminDashboard()
      toast(result.message)                         // <-- Use toast instead of alert
    } catch (error) {
      console.error("Failed to revalidate blog:", error)
      toast("Failed to revalidate blog section.")   // <-- Use toast instead of alert
    } finally {
      setIsRevalidating(false)
    }
  }

  const handleCreatePost = () => {
    router.push("/admin/blog/create")
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
          <Button onClick={handleCreatePost}>Create New Post</Button>
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
