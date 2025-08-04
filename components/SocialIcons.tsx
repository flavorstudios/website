"use client";

/**
 * Renders a list of social media links using brand icons from `react-icons`.
 *
 * --- SocialPlatform ---
 * Represents an individual social network link.
 * - `label`: Accessible name for the platform.
 * - `href`: Destination URL of the platform.
 * - `icon`: Icon component from `react-icons`.
 * - `color`: Brand hex or Tailwind color class used when `variant` is `"color"`.
 *
 * --- SocialIconsProps ---
 * - `size` (default `24`): Pixel size of each icon.
 * - `className`: Optional container class names.
 * - `variant` (default `"color"`): `"color"` displays brand color, `"monochrome"` inherits text color.
 * - `platforms` (default `defaultPlatforms`): List of platforms to render.
 *
 * --- Example ---
 * ```tsx
 * <SocialIcons size={32} variant="monochrome" />
 * ```
 */

import { clsx } from "clsx";
import type { IconType } from "react-icons";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaXTwitter,
  FaThreads,
  FaTelegram,
  FaMastodon,
  FaDiscord,
  FaGithub,
} from "react-icons/fa6";
import { SiBluesky } from "react-icons/si";
import Link from "next/link";

export type SocialVariant = "monochrome" | "color";

export interface SocialPlatform {
  label: string;
  href: string;
  icon: IconType;
  color: string; // Tailwind class or HEX
}

export const defaultPlatforms: SocialPlatform[] = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@flavorstudios",
    icon: FaYoutube,
    color: "text-red-600",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/flavorstudios",
    icon: FaInstagram,
    color: "text-pink-500",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/flavourstudios",
    icon: FaFacebook,
    color: "text-blue-600",
  },
  {
    label: "X",
    href: "https://twitter.com/flavor_studios",
    icon: FaXTwitter,
    color: "text-white",
  },
  {
    label: "Threads",
    href: "https://www.threads.net/@flavorstudios",
    icon: FaThreads,
    color: "text-white",
  },
  {
    label: "Bluesky",
    href: "https://bsky.app/profile/flavorstudios.in",
    icon: SiBluesky,
    color: "text-sky-600",
  },
  {
    label: "Telegram",
    href: "https://t.me/flavorstudios",
    icon: FaTelegram,
    color: "text-blue-400",
  },
  {
    label: "Mastodon",
    href: "https://mastodon.social/@flavorstudios",
    icon: FaMastodon,
    color: "text-purple-600",
  },
  {
    label: "Discord",
    href: "https://discord.gg/agSZAAeRzn",
    icon: FaDiscord,
    color: "text-indigo-500",
  },
  {
    label: "GitHub",
    href: "https://github.com/flavorstudios",
    icon: FaGithub,
    color: "text-white",
  },
];

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
  platforms = defaultPlatforms,
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
            "focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full text-white",
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
