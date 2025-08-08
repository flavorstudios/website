export type UserRole = string

// ---------- Existing high-level dashboard permissions ----------
export interface RolePermissions {
  canManageBlogs: boolean
  canManageVideos: boolean
  canManageMedia: boolean   // existing flag retained
  canManageComments: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
  canManageSystem: boolean
  canHandleContacts: boolean
  canManageCategories: boolean

  // NEW: granular media permissions (ownership-aware)
  media?: MediaPermissions
}

// NEW: ownership-aware shape
export interface OwnershipPermission {
  own: boolean
  any: boolean
}

// NEW: granular media actions
export interface MediaPermissions {
  view: OwnershipPermission
  upload: boolean
  edit: OwnershipPermission
  delete: OwnershipPermission
}

// ---------- Defaults (backward compatible) ----------
export const defaultRolePermissions: Record<string, RolePermissions> = {
  admin: {
    canManageBlogs: true,
    canManageVideos: true,
    canManageMedia: true,
    canManageComments: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageSystem: true,
    canHandleContacts: true,
    canManageCategories: true,
    media: {
      view:   { own: true, any: true },
      upload: true,
      edit:   { own: true, any: true },
      delete: { own: true, any: true },
    },
  },
  editor: {
    canManageBlogs: true,
    canManageVideos: true,
    canManageMedia: true,
    canManageComments: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageSystem: false,
    canHandleContacts: false,
    canManageCategories: true,
    media: {
      view:   { own: true, any: true },
      upload: true,
      edit:   { own: true, any: false },   // can edit own, not others
      delete: { own: true, any: false },   // can delete own, not others
    },
  },
  support: {
    canManageBlogs: false,
    canManageVideos: false,
    canManageMedia: false,
    canManageComments: true,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSystem: false,
    canHandleContacts: true,
    canManageCategories: false,
    media: {
      view:   { own: true, any: false },
      upload: false,
      edit:   { own: true, any: false },   // can edit metadata of own uploads only (if you prefer read-only, set own:false)
      delete: { own: false, any: false },
    },
  },
}

// ---------- Optional environment override (kept from your version) ----------
let customRolePermissions: Record<string, RolePermissions> = {}
try {
  const raw =
    process.env.CUSTOM_ROLE_PERMISSIONS ||
    process.env.NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS
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

// ---------- Existing helpers (unchanged behavior) ----------
export function hasPermission(
  userRole: UserRole,
  permission: keyof RolePermissions
): boolean {
  // boolean coercion in case of undefined in custom overrides
  return Boolean(getPermissions(userRole)[permission])
}

export function getAccessibleSections(userRole: UserRole): string[] {
  const permissions = getPermissions(userRole)
  const sections: string[] = ["overview"] // Everyone can see overview

  if (permissions.canManageBlogs) sections.push("blogs")
  if (permissions.canManageVideos) sections.push("videos")
  if (permissions.canManageMedia) sections.push("media")
  if (permissions.canManageCategories) sections.push("categories")
  if (permissions.canManageComments) sections.push("comments")
  if (permissions.canManageUsers) sections.push("users")
  if (permissions.canHandleContacts)
    sections.push("inbox", "applications")
  if (permissions.canManageSystem) sections.push("pages", "system", "audit-logs")

  return sections
}

// ---------- NEW helpers for media ACL ----------
export function hasMediaPermission(
  userRole: UserRole,
  action: keyof MediaPermissions,
  ownership: "own" | "any" = "any"
): boolean {
  const media = getPermissions(userRole).media
  if (!media) return false
  if (action === "upload") return !!media.upload
  const perms = media[action] as OwnershipPermission
  return ownership === "own" ? !!perms.own : !!perms.any
}

// Utility you can call in routes: can this user act on a MediaDoc?
// (keeps your route code clean and consistent)
export function canActOnMedia(
  userRole: UserRole,
  action: "view" | "edit" | "delete",
  meUid: string,
  media: { createdBy?: string | null }
): boolean {
  const isOwner = (media.createdBy || "") === meUid
  const ownership: "own" | "any" = isOwner ? "own" : "any"
  return hasMediaPermission(userRole, action as keyof MediaPermissions, ownership)
}
