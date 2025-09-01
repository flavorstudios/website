import DashboardOverview from "./dashboard-overview";
import BlogManager from "./blog-manager";
import VideoManager from "./video-manager";
import CommentManager from "./comment-manager";
import SystemTools from "./system-tools";
import UserManagement from "./user-management/UserManagement";
import CategoryManager from "@/components/admin/category/CategoryManager";
import EmailInbox from "./email-inbox";
import MediaLibrary from "./media/MediaLibrary";
import CareerApplications from "./career-applications";
import SystemSettings from "./system-settings";
import { clientEnv } from "@/env/client";

export {
  DashboardOverview,
  BlogManager,
  VideoManager,
  CommentManager,
  SystemTools,
  UserManagement,
  CategoryManager,
  EmailInbox,
  MediaLibrary,
  CareerApplications,
  SystemSettings,
};

if (clientEnv.NODE_ENV !== "production") {
  const components = {
    DashboardOverview,
    BlogManager,
    VideoManager,
    CommentManager,
    SystemTools,
    UserManagement,
    CategoryManager,
    EmailInbox,
    MediaLibrary,
    CareerApplications,
    SystemSettings,
  } as const;

  for (const [name, component] of Object.entries(components)) {
    if (!component) {
      console.warn(
        `Admin dashboard component "${name}" is undefined. Check exports in components/index.ts.`
      );
    }
  }
}
