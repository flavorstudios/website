import { prisma } from "@/lib/prisma";

export const videoStore = {
  async getAll() {
    return await prisma.video.findMany({
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    });
  },

  async getPublished() {
    return await prisma.video.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    });
  },

  async getBySlug(slug: string) {
    return await prisma.video.findUnique({
      where: { slug },
      include: { category: true },
    });
  },

  async create(data: any) {
    return await prisma.video.create({
      data: {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        coverImage: data.coverImage || "",
        videoUrl: data.videoUrl || "",
        categoryId: data.categoryId, // must be valid
        isPublished: data.isPublished || false,
        featured: data.featured || false,
        author: data.author || "Flavor Studios",
        publishedAt: data.publishedAt || (data.isPublished ? new Date() : null),
        readTime: data.readTime || "5 min",
        views: data.views || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  async update(id: string, updates: any) {
    return await prisma.video.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  },

  async delete(id: string) {
    await prisma.video.delete({ where: { id } });
    return true;
  },
};