"use client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
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
import { useRouter } from "next/navigation"

interface UserMenuProps {
  avatar?: string
  name: string
  userRole: string
  onLogout: () => void
}

export function UserMenu({ avatar, name, userRole, onLogout }: UserMenuProps) {
  const router = useRouter()

  const handleNavigate = (href: string) => {
    router.push(href)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="User menu"
          data-testid="admin-user-menu-trigger"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatar || "/admin-avatar.jpg"} alt="User avatar" />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 sm:w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{userRole}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => handleNavigate("/admin/dashboard/settings")}>
            <User className="h-4 w-4 mr-2" /> Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleNavigate("/admin/dashboard/users")}> 
            <Shield className="h-4 w-4 mr-2" /> User Roles
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleNavigate("/admin/dashboard/system")}>
            <History className="h-4 w-4 mr-2" /> Activity Log
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleNavigate("/admin/login")}>
          <ArrowLeftRight className="h-4 w-4 mr-2" /> Switch Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="text-destructive focus:bg-destructive/10 focus:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
        >
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 text-left"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu