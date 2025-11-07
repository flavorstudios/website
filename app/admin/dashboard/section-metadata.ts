import type { SectionId } from "./sections";

export const SECTION_HEADINGS: Record<SectionId, string> = {
  overview: "Dashboard Overview",
  blogs: "Blog Posts",
  videos: "Videos",
  media: "Media Manager",
  categories: "Categories",
  comments: "Comments & Reviews",
  applications: "Applications",
  inbox: "Email Inbox",
  users: "Users",
  settings: "Settings",
  system: "System Tools",
};

export const SECTION_DESCRIPTIONS: Record<SectionId, string> = {
  overview: "Track activity, performance, and quick actions for your studio.",
  blogs: "Manage your blog posts, drafts, and editorial calendar.",
  videos: "Manage your YouTube content and upcoming releases.",
  media: "Organize and review your uploaded media assets before publishing.",
  categories: "Maintain categories to improve content discovery.",
  comments: "Moderate community feedback and respond quickly.",
  applications: "Manage all user submissions and job applications.",
  inbox: "Stay on top of studio email and automated alerts.",
  users: "Manage teammate profiles, roles, and permissions.",
  settings: "Configure integrations and admin preferences.",
  system: "Access deployment and maintenance utilities.",
};