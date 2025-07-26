"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CategoryDropdown } from "@/components/ui/category-dropdown"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"

import BlogTable from "@/components/admin/blog/BlogTable"
import BlogBulkActions from "@/components/admin/blog/BlogBulkActions"

import type { BlogPost } from "@/lib/content-store"
import type { CategoryData } from "@/lib/dynamic-categories"
import { revalidateBlogAndAdminDashboard } from "@/app/admin/actions"

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (currentPage <= 3) return i + 1
    if (currentPage >= totalPages - 2) return totalPages - 4 + i
    return currentPage - 2 + i
  })

  return (
    <div className="flex items-center justify-center gap-2 my-4 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  )
}

export const BlogManager = () => {
  const [isRevalidating, setIsRevalidating] = useState(false)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [currentPage, setCurrentPage] = useState(1)
  const POSTS_PER_PAGE = 10

  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [postRes, catRes] = await Promise.all([
        fetch("/api/admin/blogs", { credentials: "include" }),
        fetch("/api/admin/categories?type=blog", { credentials: "include" }),
      ])
      const postData = await postRes.json()
      const catData = await catRes.json()

      setPosts(postData.posts || [])
      setCategories(
        (catData.categories || []).map((c: Partial<CategoryData>) => ({
          name: c.name ?? (c as { title?: string }).title ?? "",
          slug: c.slug ?? "",
          count: c.count ?? (c as { postCount?: number }).postCount ?? 0,
          tooltip: c.tooltip,
        }))
      )
    } catch (err) {
      console.error("Failed to load posts:", err)
      toast("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

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

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        toast("Post deleted")
        await loadData()
        setSelected((prev) => {
          const s = new Set(prev)
          s.delete(id)
          return s
        })
      } else {
        const data = await res.json()
        toast(data.error || "Failed to delete")
      }
    } catch (err) {
      console.error("Delete failed", err)
      toast("Failed to delete")
    }
  }

  const togglePublish = async (id: string, publish: boolean) => {
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: publish ? "published" : "draft" }),
      })
      if (res.ok) {
        toast(publish ? "Post published" : "Post unpublished")
        await loadData()
      } else {
        const data = await res.json()
        toast(data.error || "Update failed")
      }
    } catch (err) {
      console.error("Publish toggle failed", err)
      toast("Update failed")
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(filteredPosts.map((p) => p.id)))
    } else {
      setSelected(new Set())
    }
  }

  const handleBulk = async (action: "publish" | "unpublish" | "delete") => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    for (const id of ids) {
      if (action === "delete") await deletePost(id)
      else await togglePublish(id, action === "publish")
    }
    setSelected(new Set())
    await loadData()
  }

  const filteredPosts = posts.filter((post) => {
    const inCategory =
      category === "all" ||
      post.category === category ||
      (Array.isArray(post.categories) && post.categories.includes(category))

    const inStatus = status === "all" || post.status === status
    const matchesSearch = post.title
      .toLowerCase()
      .includes(search.toLowerCase())

    return inCategory && inStatus && matchesSearch
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title)
    if (sortBy === "status") return a.status.localeCompare(b.status)
    return (
      new Date(b.publishedAt || b.createdAt).getTime() -
      new Date(a.publishedAt || a.createdAt).getTime()
    )
  })

  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE) || 1
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search, category, status, sortBy])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold">Blog Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRevalidateBlog}
            disabled={isRevalidating}
            size="sm"
            className="rounded-xl px-4 flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isRevalidating ? "animate-spin" : ""}`} />
            {isRevalidating ? "Refreshing..." : "Refresh"}
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

      {/* Blog management UI section */}
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60"
          />
          <CategoryDropdown
            categories={categories}
            selectedCategory={category}
            onCategoryChange={setCategory}
            placeholder="All categories"
            className="w-full sm:w-48"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        <BlogBulkActions
          count={selected.size}
          onPublish={() => handleBulk("publish")}
          onUnpublish={() => handleBulk("unpublish")}
          onDelete={() => handleBulk("delete")}
        />

        {/* Table */}
        <BlogTable
          posts={paginatedPosts}
          selected={selected}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          onDelete={deletePost}
          onTogglePublish={togglePublish}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
