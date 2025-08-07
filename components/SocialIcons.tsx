"use client";

/**
 * Renders a list of social media links using brand icons from `react-icons` and centralized platform data.
 *
 * --- SocialPlatform ---
 * - `label`: Accessible name for the platform.
 * - `href`: Destination URL.
 * - `icon`: Icon component from `react-icons`.
 * - `color`: Brand hex or Tailwind color class used when `variant` is `"color"`.
 *
 * --- SocialIconsProps ---
 * - `size` (default `24`): Pixel size of each icon.
 * - `className`: Optional container class names.
 * - `variant` (default `"color"`): `"color"` displays brand color, `"monochrome"` inherits text color.
 * - `platforms` (default `SOCIAL_PLATFORMS`): List of platforms to render.
 *
 * Example:
 * <SocialIcons size={32} variant="monochrome" />
 */

import { clsx } from "clsx";
import Link from "next/link";
import type { IconType } from "react-icons";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/constants";

export type SocialVariant = "monochrome" | "color";

export interface SocialIconsProps {
  size?: number;
  className?: string;
  variant?: SocialVariant;
  platforms?: SocialPlatform[];
}

export function SocialIcons({
  size = 24,
  className,
  variant = "color",
  platforms = SOCIAL_PLATFORMS, // Default to centralized array
}: SocialIconsProps) {
  return (
    <div className={clsx("flex items-center gap-x-2", className)}>
      {platforms.map(({ label, href, icon: Icon, color }) => (
        <Link
          key={label}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full",
            "motion-safe:transition-all motion-safe:hover:scale-105 motion-safe:hover:opacity-80",
            variant === "color" && color && color !== "text-white" && color
          )}
        >
          <Icon
            size={size}
            className={
              variant === "color" && color && !color.startsWith("#") && color !== "text-white"
                ? color
                : ""
            }
            color={variant === "color" && color && color.startsWith("#") ? color : undefined}
            aria-hidden="true"
          />
          <span className="sr-only">{label}</span>
        </Link>
      ))}
    </div>
  );
}

export default SocialIcons;
