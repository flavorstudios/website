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

// --- Official Social Media Links ---
export const SOCIAL_LINKS = {
  youtube: "https://www.youtube.com/@flavorstudios",
  facebook: "https://www.facebook.com/flavourstudios",   // Note: spelling is "flavour"
  instagram: "https://www.instagram.com/flavorstudios",
  twitter: "https://twitter.com/flavor_studios",
  threads: "https://www.threads.net/@flavorstudios",
  telegram: "https://t.me/flavorstudios",
  discord: "https://discord.gg/agSZAAeRzn", // Discord invite link (best for joining)
  discordChannel: "https://discord.com/channels/@flavorstudios", // Direct channel/user link (optional)
  github: "https://github.com/flavorstudios",
  reddit: "https://www.reddit.com/r/flavorstudios/",
  linkedin: "https://www.linkedin.com/company/flavorstudios",
  // Add new links below as needed
};
