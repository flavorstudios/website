import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the current year dynamically
 * This utility ensures consistent year display across the entire website
 */
export function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * Format copyright text with dynamic year
 */
export function getCopyrightText(companyName = "Flavor Studios"): string {
  return `© ${getCurrentYear()} ${companyName}. All rights reserved.`
}
