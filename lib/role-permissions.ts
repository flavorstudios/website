export type UserRole = string

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

export const defaultRolePermissions: Record<string, RolePermissions> = {
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

let customRolePermissions: Record<string, RolePermissions> = {}
try {
  const raw = process.env.CUSTOM_ROLE_PERMISSIONS || process.env.NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS
  if (raw) {
    customRolePermissions = JSON.parse(raw)
  }
} catch (err) {
  console.error("Failed to parse CUSTOM_ROLE_PERMISSIONS", err)
}

function getPermissions(role: UserRole): RolePermissions {
  return (
    customRolePermissions[role] ||
    defaultRolePermissions[role] ||
    defaultRolePermissions["support"]
  )
}

export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  return getPermissions(userRole)[permission]
}

export function getAccessibleSections(userRole: UserRole): string[] {
  const permissions = getPermissions(userRole)
  const sections: string[] = ["overview"] // Everyone can see overview

  if (permissions.canManageBlogs) sections.push("blogs")
  if (permissions.canManageVideos) sections.push("videos")
  if (permissions.canManageCategories) sections.push("categories")
  if (permissions.canManageComments) sections.push("comments")
  if (permissions.canManageUsers) sections.push("users")
  if (permissions.canHandleContacts) sections.push("inbox")
  if (permissions.canManageSystem) sections.push("pages", "system")

  return sections
}
