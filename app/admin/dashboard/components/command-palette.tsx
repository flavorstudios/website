"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import * as Dialog from "@radix-ui/react-dialog"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface BlogPost {
  id: string
  title: string
}

interface UserResult {
  uid: string
  email?: string
  displayName?: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [users, setUsers] = useState<UserResult[]>([])
  const router = useRouter()

  // Listen for external events to open the palette
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener("open-command-palette", handleOpen)
    return () => window.removeEventListener("open-command-palette", handleOpen)
  }, [])

  // Fetch posts and users when the query changes
  useEffect(() => {
    if (!open) return
    if (query.length < 2) {
      setPosts([])
      setUsers([])
      return
    }
    let active = true
    const fetchResults = async () => {
      try {
        const [postsRes, usersRes] = await Promise.all([
          fetch("/api/blogs"),
          fetch(`/api/admin/users?search=${encodeURIComponent(query)}`),
        ])
        const [postsData, usersData] = await Promise.all([
          postsRes.json(),
          usersRes.json(),
        ])
        if (!active) return
        setPosts(
          (postsData || [])
            .filter((p: BlogPost) =>
              p.title?.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 5),
        )
        setUsers((usersData?.users || []).slice(0, 5))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    }
    fetchResults()
    return () => {
      active = false
    }
  }, [query, open])

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const navigationItems = [
    { label: "Overview", href: "/admin/dashboard" },
    { label: "Blog Posts", href: "/admin/dashboard/blog-posts" },
    { label: "Videos", href: "/admin/dashboard/videos" },
    { label: "Media", href: "/admin/dashboard/media" },
    { label: "Categories", href: "/admin/dashboard/categories" },
    { label: "Comments", href: "/admin/dashboard/comments" },
    { label: "Applications", href: "/admin/dashboard/applications" },
    { label: "Inbox", href: "/admin/dashboard/inbox" },
    { label: "Users", href: "/admin/dashboard/users" },
    { label: "System", href: "/admin/dashboard/system" },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          aria-label="Command Palette"
        >
          <Command
            label="Command Palette"
            className="max-w-lg w-full rounded-md border bg-background shadow-lg"
          >
            <div className="flex items-center border-b px-3" aria-hidden="true">
              <Search className="mr-2 h-4 w-4 opacity-50" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Type a command or search..."
                className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List className="max-h-60 overflow-y-auto p-2">
              <Command.Empty>No results found.</Command.Empty>
              <Command.Group heading="Navigation">
                {navigationItems.map((item) => (
                  <Command.Item
                    key={item.href}
                    onSelect={() => navigate(item.href)}
                    className={cn(
                      "cursor-pointer rounded-md px-2 py-1.5 text-sm",
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    )}
                  >
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
              {posts.length > 0 && (
                <Command.Group heading="Posts">
                  {posts.map((post) => (
                    <Command.Item
                      key={post.id}
                      onSelect={() => navigate(`/admin/blog/edit/${post.id}`)}
                      className={cn(
                        "cursor-pointer rounded-md px-2 py-1.5 text-sm",
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      )}
                    >
                      {post.title}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              {users.length > 0 && (
                <Command.Group heading="Users">
                  {users.map((user) => (
                    <Command.Item
                      key={user.uid}
                      onSelect={() => navigate(`/admin/dashboard/users?uid=${user.uid}`)}
                      className={cn(
                        "cursor-pointer rounded-md px-2 py-1.5 text-sm",
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      )}
                    >
                      {user.email || user.displayName || user.uid}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default CommandPalette