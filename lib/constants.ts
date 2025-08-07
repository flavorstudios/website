/**
 * Centralized site-wide constants for Flavor Studios.
 * Update here to reflect changes everywhere across the project.
 */

export const SITE_NAME = "Flavor Studios";
export const SITE_URL = "https://flavorstudios.in";
export const SITE_BRAND = SITE_NAME;

// ✅ Centralized site description for all SEO/meta/schema
export const SITE_DESCRIPTION =
  "Flavor Studios brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.";

// Email constants
export const SUPPORT_EMAIL = "contact@flavorstudios.in";
// REMOVE ADMIN_EMAIL export! Use process.env.ADMIN_EMAIL everywhere in secure code

// Default Open Graph/Twitter fallback image
export const SITE_DEFAULT_IMAGE = `${SITE_URL}/cover.jpg`; // 1200x630 recommended

// Official Twitter/X handle (used in metadata)
export const SITE_BRAND_TWITTER = "@flavor_studios";

// Site logo (ideal for schema.org publisher/logo, PWA, favicon, etc.)
export const SITE_LOGO_URL = `${SITE_URL}/logo.png`; // Make sure this file exists in your public/ folder

// --- Official Social Media Links (audit order, canonical) ---
export const SOCIAL_LINKS = {
  youtube:   "https://www.youtube.com/@flavorstudios",
  facebook:  "https://www.facebook.com/flavourstudios",           // Note: spelling is "flavour"
  instagram: "https://www.instagram.com/flavorstudios",
  linkedin:  "https://www.linkedin.com/company/flavorstudios",
  threads:   "https://www.threads.com/@flavorstudios",            // .com (audit order, not .net)
  bluesky:   "https://flavorstudios.bsky.social",                 // .bsky.social (audit order)
  reddit:    "https://www.reddit.com/r/flavorstudios/",
  x:         "https://x.com/flavor_studios",                      // x.com (not twitter.com)
  tumblr:    "https://tumblr.com/flavorstudios",                  // .com/flavorstudios
  telegram:  "https://t.me/flavorstudios",
  mastodon:  "https://mastodon.social/@flavorstudios",
  discord:   "https://discord.gg/agSZAAeRzn"
} as const;

// ---- Social Platform Type and Array for Icons/Links ----
import type { IconType } from "react-icons";
import {
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaThreads,
  FaRedditAlien,
  FaXTwitter,
  FaTumblr,
  FaTelegram,
  FaMastodon,
  FaDiscord,
} from "react-icons/fa6";
import { SiBluesky } from "react-icons/si";

// This array must strictly follow the order above!
export interface SocialPlatform {
  label: string;
  href: string;
  icon: IconType;
  color: string; // Tailwind class or HEX
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { label: "YouTube",   href: SOCIAL_LINKS.youtube,   icon: FaYoutube,     color: "text-red-600" },
  { label: "Facebook",  href: SOCIAL_LINKS.facebook,  icon: FaFacebook,    color: "text-blue-600" },
  { label: "Instagram", href: SOCIAL_LINKS.instagram, icon: FaInstagram,   color: "text-pink-500" },
  { label: "LinkedIn",  href: SOCIAL_LINKS.linkedin,  icon: FaLinkedin,    color: "text-blue-700" },
  { label: "Threads",   href: SOCIAL_LINKS.threads,   icon: FaThreads,     color: "text-black" },
  { label: "Bluesky",   href: SOCIAL_LINKS.bluesky,   icon: SiBluesky,     color: "text-sky-600" },
  { label: "Reddit",    href: SOCIAL_LINKS.reddit,    icon: FaRedditAlien, color: "text-orange-600" },
  { label: "X",         href: SOCIAL_LINKS.x,         icon: FaXTwitter,    color: "text-black" },
  { label: "Tumblr",    href: SOCIAL_LINKS.tumblr,    icon: FaTumblr,      color: "text-blue-700" },
  { label: "Telegram",  href: SOCIAL_LINKS.telegram,  icon: FaTelegram,    color: "text-blue-400" },
  { label: "Mastodon",  href: SOCIAL_LINKS.mastodon,  icon: FaMastodon,    color: "text-purple-600" },
  { label: "Discord",   href: SOCIAL_LINKS.discord,   icon: FaDiscord,     color: "text-indigo-500" }
];
