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
    // Placeholder implementation returning default stats
    return {
      totalPosts: 0,
      totalVideos: 0,
      totalComments: 0,
      pendingComments: 0,
      totalViews: 0,
      lastBackup: "",
      storageUsed: "",
    };
  },
};
