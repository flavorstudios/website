"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Post { id: string; title: string; slug: string }
interface Video { id: string; title: string; slug: string }
interface User { uid: string; email?: string; displayName?: string }
interface Category { id: string; title: string; slug: string; type: string }
interface TagResult { id: string; title: string }

interface SearchResults {
  posts: Post[]
  videos: Video[]
  users: User[]
  categories: Category[]
  tags: string[]
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function highlight(text: string, term: string) {
  if (!term) return text
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-blue-100 text-blue-900 rounded px-1">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

const empty: SearchResults = { posts: [], videos: [], users: [], categories: [], tags: [] }
type ResultItem = Post | Video | User | Category | TagResult

export function AdminSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState("all")
  const [results, setResults] = useState<SearchResults>(empty)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const debounced = useDebounce(query, 300)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(empty)
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
      if (!res.ok) throw new Error("Search failed")
      const data = (await res.json()) as SearchResults
      setResults(data)
    } catch (e: unknown) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        console.error(e)
      }
      setResults(empty)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    search(debounced)
  }, [debounced, search])

  useEffect(() => {
    if (open) {
      setQuery("")
      setResults(empty)
      setTab("all")
      setSelectedIndex(-1)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const lists = {
    posts: results.posts as ResultItem[],
    videos: results.videos as ResultItem[],
    users: results.users as ResultItem[],
    categories: results.categories as ResultItem[],
    tags: results.tags.map((t) => ({ id: t, title: t })) as ResultItem[],
  }

  const current: ResultItem[] =
    tab === "all"
      ? [
          ...results.posts,
          ...results.videos,
          ...results.users,
          ...results.categories,
          ...results.tags.map((t) => ({ id: t, title: t })),
        ]
      : lists[tab as keyof typeof lists]

  const handleKey = (e: React.KeyboardEvent) => {
    if ("ontouchstart" in window) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((p) => (p + 1) % current.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((p) => (p <= 0 ? current.length - 1 : p - 1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      const item = current[selectedIndex]
      if (!item) return
      let href = "#"
      if ((item as Post).slug) href = `/blog/${(item as Post).slug}`
      if ((item as Video).slug && (item as Video).id) href = `/watch/${(item as Video).slug}`
      if ((item as User).uid) href = `/admin/dashboard/users?uid=${(item as User).uid}`
      if ((item as Category).type) href = `/admin/dashboard/categories?slug=${(item as Category).slug}`
      if ((item as TagResult).title && !(item as Category).type && !(item as User).uid && !(item as Video).id)
        href = `/blog/tag/${encodeURIComponent((item as TagResult).title)}`
      window.location.href = href
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="text-sm font-medium transition-colors hover:text-blue-600"
      >
        <Search className="h-5 w-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-full max-h-full sm:max-w-3xl p-0 gap-0 border-none bg-transparent sm:bg-white sm:border sm:rounded-lg"
          onKeyDown={handleKey}
        >
          <div className="fixed inset-0 sm:relative bg-background/95 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none flex flex-col">
            <div className="flex-shrink-0 border-b bg-white p-4">
              <div className="flex items-center gap-3 w-full">
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts, users, categories..."
                  className="border-0 focus-visible:ring-0 text-base flex-1"
                  autoComplete="off"
                />
                {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground flex-shrink-0" />}
              </div>
              <Tabs value={tab} onValueChange={setTab} className="mt-4">
                <TabsList className="grid grid-cols-3 sm:grid-cols-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Searching...</span>
                </div>
              )}
              {!loading && current.length === 0 && debounced.trim() && (
                <div className="text-center py-8 px-4 text-muted-foreground">
                  No results found for &quot;{debounced}&quot;
                </div>
              )}
              {!loading && current.length > 0 && (
                <div className="p-2 space-y-2">
                  {(tab === "all" || tab === "posts") &&
                    results.posts.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Posts
                        </div>
                        {results.posts.map((post, i) => (
                          <Link
                            key={post.id}
                            href={`/admin/blog/edit/${post.id}`}
                            onClick={() => setOpen(false)}
                            className={`block p-3 rounded-lg hover:bg-muted transition-colors ${
                              selectedIndex === i && (tab === "all" ? true : tab === "posts") ? "bg-muted" : ""
                            }`}
                          >
                            <div className="font-medium text-sm">
                              {highlight(post.title, debounced)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  {(tab === "all" || tab === "videos") &&
                    results.videos.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Videos
                        </div>
                        {results.videos.map((video, i) => (
                          <Link
                            key={video.id}
                            href={`/watch/${video.slug}`}
                            onClick={() => setOpen(false)}
                            className={`block p-3 rounded-lg hover:bg-muted transition-colors ${
                              selectedIndex ===
                              (tab === "all" ? results.posts.length + i : i)
                                ? "bg-muted"
                                : ""
                            }`}
                          >
                            <div className="font-medium text-sm">
                              {highlight(video.title, debounced)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  {(tab === "all" || tab === "users") &&
                    results.users.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Users
                        </div>
                        {results.users.map((user, i) => (
                          <Link
                            key={user.uid}
                            href={`/admin/dashboard/users?uid=${user.uid}`}
                            onClick={() => setOpen(false)}
                            className={`block p-3 rounded-lg hover:bg-muted transition-colors ${
                              selectedIndex ===
                              (tab === "all"
                                ? results.posts.length + results.videos.length + i
                                : i)
                                ? "bg-muted"
                                : ""
                            }`}
                          >
                            <div className="font-medium text-sm">
                              {highlight(user.email || user.displayName || user.uid, debounced)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  {(tab === "all" || tab === "categories") &&
                    results.categories.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Categories
                        </div>
                        {results.categories.map((cat, i) => (
                          <Link
                            key={cat.id}
                            href={`/admin/dashboard/categories?slug=${cat.slug}`}
                            onClick={() => setOpen(false)}
                            className={`block p-3 rounded-lg hover:bg-muted transition-colors ${
                              selectedIndex ===
                              (tab === "all"
                                ? results.posts.length +
                                  results.videos.length +
                                  results.users.length +
                                  i
                                : i)
                                ? "bg-muted"
                                : ""
                            }`}
                          >
                            <div className="font-medium text-sm">
                              {highlight(cat.title, debounced)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  {(tab === "all" || tab === "tags") && results.tags.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Tags
                      </div>
                      {results.tags.map((tag, i) => (
                        <Link
                          key={tag}
                          href={`/blog/tag/${encodeURIComponent(tag)}`}
                          onClick={() => setOpen(false)}
                          className={`block p-3 rounded-lg hover:bg-muted transition-colors ${
                            selectedIndex ===
                            (tab === "all"
                              ? results.posts.length +
                                results.videos.length +
                                results.users.length +
                                results.categories.length +
                                i
                              : i)
                              ? "bg-muted"
                              : ""
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {highlight(tag, debounced)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {!debounced.trim() && !loading && (
              <div className="p-4 border-t bg-muted/30 text-center text-xs text-muted-foreground">
                Use ↑↓ to navigate, Enter to select, Esc to close
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdminSearch