"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface BlogHeaderProps {
  title?: string
  description?: string
  onSearch?: (query: string) => void
}

export function BlogHeader({
  title = "Blog",
  description = "Latest news, reviews, and insights from the world of anime",
  onSearch,
}: BlogHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl mb-8 opacity-90">{description}</p>

          {onSearch && (
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
