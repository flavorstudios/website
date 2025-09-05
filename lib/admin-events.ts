import type { SectionId } from "@/app/admin/dashboard/sections";

export const ADMIN_NAVIGATE = "admin-navigate";
export const ADMIN_SEARCH = "admin-search";
export const ADMIN_REFRESH = "admin-refresh";
export const ADMIN_OPEN_MEDIA_UPLOAD = "admin-open-media-upload";
export const ADMIN_OPEN_KEYBOARD_SHORTCUTS = "admin-open-keyboard-shortcuts";

export function dispatchAdminNavigate(section: SectionId) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ADMIN_NAVIGATE, { detail: { section } })
  );
}