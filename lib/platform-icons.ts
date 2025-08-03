// lib/platform-icons.ts

import type { IconType } from "react-icons";
import {
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaDiscord,
  FaTelegram,
  FaThreads,
  FaRedditAlien,
  FaWhatsapp,
  FaMastodon,
  FaGithub,
} from "react-icons/fa6";
import { SiBluesky } from "react-icons/si";

/**
 * Map each supported platform label to its icon.
 * Keys should match your UI/platform label usage.
 */
export const platformIcons: Record<string, IconType> = {
  YouTube: FaYoutube,
  Facebook: FaFacebook,
  Instagram: FaInstagram,
  X: FaXTwitter,         // "X" (formerly Twitter)
  Discord: FaDiscord,
  Telegram: FaTelegram,
  Threads: FaThreads,
  Reddit: FaRedditAlien,
  WhatsApp: FaWhatsapp,
  Mastodon: FaMastodon,
  Bluesky: SiBluesky,
  GitHub: FaGithub,
};
