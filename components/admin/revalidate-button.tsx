"use client"

import { useState } from "react"
import { revalidateBlog, revalidateWatch, revalidateHome } from "@/app/actions/revalidate"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RevalidateButton() {
  const [isRevalidating, setIsRevalidating] = useState(false)
  const [path, setPath] = useState("blog")
  const [status, setStatus] = useState<null | "success" | "error">(null)

  const handleRevalidate = async () => {
    setIsRevalidating(true)
    setStatus(null)

    try {
      if (path === "blog") {
        await revalidateBlog()
      } else if (path === "watch") {
        await revalidateWatch()
      } else if (path === "home") {
        await revalidateHome()
      }

      setStatus("success")
      setTimeout(() => setStatus(null), 3000)
    } catch (error) {
      console.error("Revalidation error:", error)
      setStatus("error")
    } finally {
      setIsRevalidating(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center">
      <Select value={path} onValueChange={setPath}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select path" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="blog">Blog</SelectItem>
          <SelectItem value="watch">Watch</SelectItem>
          <SelectItem value="home">Home</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="default"
        onClick={handleRevalidate}
        disabled={isRevalidating}
        className="bg-yellow-500 hover:bg-yellow-600 text-black"
      >
        {isRevalidating
          ? "Revalidating..."
          : `Revalidate ${path === "home" ? "Home" : path === "blog" ? "Blog" : "Watch"} Cache`}
      </Button>

      {status === "success" && <span className="text-green-500 text-sm">Cache cleared successfully!</span>}

      {status === "error" && <span className="text-red-500 text-sm">Failed to clear cache.</span>}
    </div>
  )
}
