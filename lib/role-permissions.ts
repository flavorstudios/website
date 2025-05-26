export type UserRole = "admin" | "editor" | "support"

export interface RolePermissions {
  canManageBlogs: boolean
  canManageVideos: boolean
  canManageComments: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
  canManageSystem: boolean
  canHandleContacts: boolean
  canManageCategories: boolean
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canManageBlogs: true,
    canManageVideos: true,
    canManageComments: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageSystem: true,
    canHandleContacts: true,
    canManageCategories: true,
  },
  editor: {
    canManageBlogs: true,
    canManageVideos: true,
    canManageComments: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageSystem: false,
    canHandleContacts: false,
    canManageCategories: true,
  },
  support: {
    canManageBlogs: false,
    canManageVideos: false,
    canManageComments: true,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSystem: false,
    canHandleContacts: true,
    canManageCategories: false,
  },
}

export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  return rolePermissions[userRole][permission]
}

export function getAccessibleSections(userRole: UserRole): string[] {
  const permissions = rolePermissions[userRole]
  const sections: string[] = ["overview"] // Everyone can see overview

  if (permissions.canManageBlogs) sections.push("blogs")
  if (permissions.canManageVideos) sections.push("videos")
  if (permissions.canManageCategories) sections.push("categories")
  if (permissions.canManageComments) sections.push("comments")
  if (permissions.canHandleContacts) sections.push("inbox")
  if (permissions.canManageSystem) sections.push("pages", "system")

  return sections
}
