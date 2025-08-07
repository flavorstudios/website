"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"

interface SearchResults {
  posts: { id: string; title: string }[]
  users: { uid: string; email?: string | null; displayName?: string | null }[]
  categories: { id: string; title: string }[]
}

interface CommandPaletteProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResults>({
    posts: [],
    users: [],
    categories: [],
  })

  React.useEffect(() => {
    if (!query) {
      setResults({ posts: [], users: [], categories: [] })
      return
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: SearchResults) => setResults(data))
        .catch(() => {})
    }, 200)
    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [query])

  const run = React.useCallback(
    (cb: () => void) => {
      cb()
      setOpen(false)
    },
    [setOpen],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput value={query} onValueChange={setQuery} placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {results.posts.length > 0 && (
          <>
            <CommandGroup heading="Posts">
              {results.posts.map((post) => (
                <CommandItem
                  key={post.id}
                  value={post.title}
                  onSelect={() =>
                    run(() => router.push(`/admin/blog/edit?id=${post.id}`))
                  }
                >
                  {post.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        {results.users.length > 0 && (
          <>
            <CommandGroup heading="Users">
              {results.users.map((user) => (
                <CommandItem
                  key={user.uid}
                  value={user.email || user.displayName || user.uid}
                  onSelect={() =>
                    run(() =>
                      router.push(
                        `/admin/dashboard/users?search=${encodeURIComponent(
                          user.email || "",
                        )}`,
                      ),
                    )
                  }
                >
                  {user.displayName || user.email}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        {results.categories.length > 0 && (
          <CommandGroup heading="Categories">
            {results.categories.map((cat) => (
              <CommandItem
                key={cat.id}
                value={cat.title}
                onSelect={() =>
                  run(() =>
                    router.push(
                      `/admin/dashboard/categories?search=${encodeURIComponent(
                        cat.title,
                      )}`,
                    ),
                  )
                }
              >
                {cat.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}

export default CommandPalette