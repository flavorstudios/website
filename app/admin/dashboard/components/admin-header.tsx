"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, Menu, ExternalLink, LogOut } from "lucide-react"

interface AdminHeaderProps {
  onLogout: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminHeader({ onLogout, sidebarOpen, setSidebarOpen }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Flavor Studios Admin
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search..." className="pl-10 w-64" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://flavorstudios.in", "_blank")}
            className="hidden md:flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </Button>

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/admin-avatar.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                FS
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-gray-500">Flavor Studios</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onLogout} className="text-red-600 hover:text-red-700">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
