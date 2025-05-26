"use client"

import { LayoutDashboard, ListChecks, ListOrdered, Tag, Users, Settings, MessageSquare, Mail } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useRole } from "../contexts/role-context"
import { useEffect, useState } from "react"

const navItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Your main dashboard overview",
  },
  {
    id: "products",
    label: "Products",
    icon: Tag,
    description: "Manage your products",
  },
  {
    id: "categories",
    label: "Categories",
    icon: ListOrdered,
    description: "Organize your products by categories",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ListChecks,
    description: "View and manage customer orders",
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    description: "Manage customer information",
  },
  {
    id: "comments",
    label: "Comments",
    icon: MessageSquare,
    description: "Manage user comments",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Configure store settings",
  },
]

interface AdminSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminSidebar({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const { accessibleSections, userRole } = useRole()
  const [isHovered, setIsHovered] = useState(false)

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => accessibleSections.includes(item.id) || item.id === "overview")

  // Add inbox item for users who can handle contacts
  if (accessibleSections.includes("inbox")) {
    const inboxItem = {
      id: "inbox",
      label: "Email Inbox",
      icon: Mail,
      description: "Manage contact messages",
    }

    // Insert inbox after comments if it exists, otherwise after categories
    const insertIndex = filteredNavItems.findIndex((item) => item.id === "comments")
    if (insertIndex !== -1) {
      filteredNavItems.splice(insertIndex + 1, 0, inboxItem)
    } else {
      const categoryIndex = filteredNavItems.findIndex((item) => item.id === "categories")
      if (categoryIndex !== -1) {
        filteredNavItems.splice(categoryIndex + 1, 0, inboxItem)
      }
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [setSidebarOpen])

  return (
    <>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0">
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SheetHeader className="pl-6 pr-8">
            <SheetTitle>Dashboard</SheetTitle>
          </SheetHeader>
          <Separator />
          <ScrollArea className="h-[calc(100vh-100px)] w-full">
            <div className="flex flex-col space-y-1 px-2 py-4">
              {filteredNavItems.map((item) => (
                <button
                  key={item.id}
                  className={`group flex w-full items-center space-x-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-secondary hover:text-foreground ${
                    activeSection === item.id ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div
        className="hidden border-r bg-gray-100/40 dark:bg-gray-800/40 md:block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`flex h-full flex-col gap-2 ${sidebarOpen && isHovered ? "max-w-[200px]" : "max-w-[65px]"}  transition-all`}
        >
          <div className="flex-1">
            <div className="px-2 py-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback>OM</AvatarFallback>
              </Avatar>
              <h2 className="font-semibold mt-2">{userRole === "admin" ? "Administrator" : "Moderator"}</h2>
              <p className="text-xs text-muted-foreground">Manage your store</p>
            </div>
            <Separator />
            <ScrollArea className="h-[calc(100vh-200px)] w-full">
              <div className="flex flex-col space-y-1 px-2 py-4">
                {filteredNavItems.map((item) => (
                  <button
                    key={item.id}
                    className={`group flex w-full items-center space-x-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-secondary hover:text-foreground ${
                      activeSection === item.id ? "bg-secondary text-foreground" : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    {sidebarOpen && isHovered && <span>{item.label}</span>}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  )
}
