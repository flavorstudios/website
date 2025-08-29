import { getAdminDb } from "@/lib/firebase-admin";

export interface SystemStats {
  totalPosts: number;
  totalVideos: number;
  totalComments: number;
  pendingComments: number;
  totalViews: number;
  lastBackup: string;
  storageUsed: string;
}

export const systemStore = {
  async getStats(): Promise<SystemStats> {
    try {
      const db = getAdminDb();
      const [postsSnap, videosSnap, commentsSnap, pendingSnap] = await Promise.all([
        db.collection("blogs").get(),
        db.collection("videos").get(),
        db.collectionGroup("entries").get(),
        db.collectionGroup("entries").where("status", "==", "pending").get(),
      ]);

      const totalPosts = postsSnap.size;
      const totalVideos = videosSnap.size;
      const totalComments = commentsSnap.size;
      const pendingComments = pendingSnap.size;
      const totalViews =
        postsSnap.docs.reduce((sum, d) => sum + (d.data().views || 0), 0) +
        videosSnap.docs.reduce((sum, d) => sum + (d.data().views || 0), 0);

      // Optionally fetch meta data (backup/storage)
      const systemDoc = await db.collection("system").doc("metrics").get().catch(() => null);
      const meta = systemDoc && systemDoc.exists ? systemDoc.data() : {};

      return {
        totalPosts,
        totalVideos,
        totalComments,
        pendingComments,
        totalViews,
        lastBackup: (meta as Record<string, string>).lastBackup ?? "",
        storageUsed: (meta as Record<string, string>).storageUsed ?? "",
      };
    } catch (error) {
      console.error("Failed to fetch system stats:", error);
      return {
        totalPosts: 0,
        totalVideos: 0,
        totalComments: 0,
        pendingComments: 0,
        totalViews: 0,
        lastBackup: "",
        storageUsed: "",
      };
    }
  },
};
