import { prisma } from "@/lib/prisma";

export const blogStore = {
  async getAll() {
    return await prisma.post.findMany({
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    });
  },

  async getPublished() {
    return await prisma.post.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    });
  },

  async getBySlug(slug: string) {
    return await prisma.post.findUnique({
      where: { slug },
      include: { category: true },
    });
  },

  async create(data: any) {
    return await prisma.post.create({
      data: {
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || data.content?.substring(0, 160) + "...",
        status: data.status || "draft",
        categoryId: data.categoryId, // must be valid
        tags: data.tags || [],
        featuredImage: data.featuredImage || "",
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.excerpt,
        author: data.author || "Flavor Studios",
        publishedAt: data.publishedAt || (data.status === "published" ? new Date() : null),
        readTime: data.readTime || "5 min read",
        views: data.views || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  async update(id: string, updates: any) {
    return await prisma.post.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  },

  async delete(id: string) {
    await prisma.post.delete({ where: { id } });
    return true;
  },
};