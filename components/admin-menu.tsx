"use client"

import { useState, useEffect } from "react"
import { getCategoriesWithFallback, type CategoryData } from "@/lib/dynamic-categories"
import { Edit, FileText, Video } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Props allow you to customize how the menu works
interface AdminMenuProps {
  onSectionSelect?: (section: string) => void // Optional: for parent control
  activeSection?: string
}

export function AdminMenu({ onSectionSelect, activeSection }: AdminMenuProps) {
  const [blogCategories, setBlogCategories] = useState<CategoryData[]>([])
  const [videoCategories, setVideoCategories] = useState<CategoryData[]>([])

  useEffect(() => {
    async function fetchCategories() {
      const { blogCategories, videoCategories } = await getCategoriesWithFallback()
      setBlogCategories(blogCategories)
      setVideoCategories(videoCategories)
    }
    fetchCategories()
  }, [])

  return (
    <div className="w-72 rounded-xl shadow-lg bg-white border border-gray-200 p-3">
      {/* Main Sections */}
      <div className="mb-3 space-y-1">
        <Button
          variant={activeSection === "blogs" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onSectionSelect?.("blogs")}
        >
          <FileText className="mr-3 h-5 w-5" /> Blog Posts
        </Button>
        <Button
          variant={activeSection === "videos" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onSectionSelect?.("videos")}
        >
          <Video className="mr-3 h-5 w-5" /> Videos
        </Button>
      </div>

      {/* Blog Categories */}
      {blogCategories.length > 0 && (
        <>
          <div className="mb-1 text-xs font-semibold text-gray-400 px-1">Blog Categories</div>
          <div className="mb-3 space-y-1">
            {blogCategories.map((cat) => (
              <Button
                key={`blog-${cat.slug}`}
                variant={activeSection === `blog-category-${cat.slug}` ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSectionSelect?.(`blog-category-${cat.slug}`)}
              >
                <Edit className="mr-3 h-5 w-5" />
                <span className="flex-1 truncate text-sm">{cat.name}</span>
                {cat.count > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {cat.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </>
      )}

      {/* Video Categories */}
      {videoCategories.length > 0 && (
        <>
          <div className="mb-1 text-xs font-semibold text-gray-400 px-1">Video Categories</div>
          <div className="space-y-1">
            {videoCategories.map((cat) => (
              <Button
                key={`video-${cat.slug}`}
                variant={activeSection === `video-category-${cat.slug}` ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSectionSelect?.(`video-category-${cat.slug}`)}
              >
                <Edit className="mr-3 h-5 w-5" />
                <span className="flex-1 truncate text-sm">{cat.name}</span>
                {cat.count > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {cat.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminMenu
