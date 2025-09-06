// Client-side helpers for admin authentication
// Provides unified handling for expired sessions across dashboard components.

export function handleAdminSessionExpiry(
  notify?: (message: string) => void,
  redirect = true
): void {
  const message = "Session expired. Please log in again";
  if (notify) {
    notify(message);
  }
  if (redirect && typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}