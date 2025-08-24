"use client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  User,
  Shield,
  History,
  ArrowLeftRight,
} from "lucide-react"

interface UserMenuProps {
  avatar?: string
  name: string
  userRole: string
  onLogout: () => void
}

export function UserMenu({ avatar, name, userRole, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatar || "/admin-avatar.jpg"} alt="User avatar" />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{userRole}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => window.location.assign("/admin/account")}>
          <User className="h-4 w-4 mr-2" /> Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.location.assign("/admin/roles")}>
          <Shield className="h-4 w-4 mr-2" /> User Roles
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.location.assign("/admin/activity")}>
          <History className="h-4 w-4 mr-2" /> Activity Log
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => window.location.assign("/admin/accounts")}>
          <ArrowLeftRight className="h-4 w-4 mr-2" /> Switch Account
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu