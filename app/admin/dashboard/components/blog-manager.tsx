"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, PlusCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"
import { revalidateBlogAndAdminDashboard } from "@/app/admin/actions"

export const BlogManager = () => {
  const [isRevalidating, setIsRevalidating] = useState(false)
  const router = useRouter()

  const handleRevalidateBlog = async () => {
    setIsRevalidating(true)
    try {
      const result = await revalidateBlogAndAdminDashboard()
      toast(result.message)
    } catch (error) {
      console.error("Failed to revalidate blog:", error)
      toast("Failed to revalidate blog section.")
    } finally {
      setIsRevalidating(false)
    }
  }

  const handleCreatePost = () => {
    router.push("/admin/blog/create")
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold">Blog Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRevalidateBlog}
            disabled={isRevalidating}
            variant="outline"
            size="sm"
            className="rounded-xl px-4 flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRevalidating ? "animate-spin" : ""}`} />
            {isRevalidating ? "Revalidating..." : "Revalidate Blog Section"}
          </Button>
          <Button
            onClick={handleCreatePost}
            size="sm"
            className="rounded-xl px-4 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Post
          </Button>
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
