import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Concatenate and merge Tailwind CSS class names conditionally.
 * Usage: cn("p-4", isActive && "bg-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a heading without repeating the suffix.
 * Prevents headings like "Anime Reviews Posts Posts" or "Original Series Videos Videos".
 * Usage: formatHeading(categoryName, "post") or formatHeading(categoryName, "video")
 */
export function formatHeading(categoryName: string, type: "post" | "video") {
  const suffix = type === "post" ? "Posts" : "Videos"
  const trimmed = categoryName.trim()
  // Only add the suffix if it's not already at the end (case-insensitive)
  return trimmed.toLowerCase().endsWith(suffix.toLowerCase())
    ? trimmed
    : `${trimmed} ${suffix}`
}
