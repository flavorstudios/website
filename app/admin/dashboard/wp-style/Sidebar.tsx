"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Plug,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarItem {
  id: string
  label: string
  icon: React.ElementType
  children?: SidebarItem[]
}

interface SidebarProps {
  active: string
  setActive: (id: string) => void
  open?: boolean
  setOpen?: (open: boolean) => void
}

export default function Sidebar({ active, setActive, open: controlledOpen, setOpen: setControlledOpen }: SidebarProps) {
  const [internalOpen, setInternalOpen] = useState(true)
  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // load persisted state only for uncontrolled mode
  useEffect(() => {
    if (controlledOpen === undefined) {
      const saved = localStorage.getItem("wpSidebarOpen")
      if (saved !== null) setOpen(saved === "true")
    }
  }, [controlledOpen, setOpen])

  useEffect(() => {
    if (controlledOpen === undefined) {
      localStorage.setItem("wpSidebarOpen", String(open))
    }
  }, [open, controlledOpen])

  const items: SidebarItem[] = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "posts",
      label: "Posts",
      icon: FileText,
      children: [
        { id: "posts-all", label: "All Posts", icon: FileText },
        { id: "posts-new", label: "Add New", icon: FileText },
      ],
    },
    {
      id: "media",
      label: "Media",
      icon: ImageIcon,
      children: [
        { id: "library", label: "Library", icon: ImageIcon },
        { id: "upload", label: "Add New", icon: ImageIcon },
      ],
    },
    { id: "comments", label: "Comments", icon: MessageSquare },
    { id: "plugins", label: "Plugins", icon: Plug },
  ]

  const renderItem = (item: SidebarItem) => {
    const Icon = item.icon
    const isActive = active === item.id
    const hasChildren = item.children && item.children.length > 0
    const isOpen = expanded[item.id]

    return (
      <div key={item.id} className="mb-1">
        <Button
          variant={isActive ? "default" : "ghost"}
          className={`w-full flex items-center justify-between ${
            open ? "px-3" : "px-0 justify-center"
          } h-9 text-sm`}
          onClick={() => {
            if (hasChildren) {
              setExpanded((e) => ({ ...e, [item.id]: !e[item.id] }))
            } else {
              setActive(item.id)
            }
          }}
          title={!open ? item.label : undefined}
        >
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {open && <span>{item.label}</span>}
          </span>
          {hasChildren && open && (
            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        {hasChildren && isOpen && open && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children!.map((child) => {
              const ChildIcon = child.icon
              const childActive = active === child.id
              return (
                <Button
                  key={child.id}
                  variant={childActive ? "default" : "ghost"}
                  className="w-full justify-start h-8 pl-6 text-sm"
                  onClick={() => setActive(child.id)}
                >
                  <ChildIcon className="h-3 w-3 mr-2" />
                  {child.label}
                </Button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        open ? "w-56" : "w-14"
      } flex flex-col min-h-screen`}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        {open && <p className="font-semibold text-sm">WP Admin</p>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(!open)}
          className="h-6 w-6 p-0"
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">{items.map(renderItem)}</nav>
    </aside>
  )
}
