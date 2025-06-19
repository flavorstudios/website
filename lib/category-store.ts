import { prisma } from "@/lib/prisma";

export type CategorySection = "blog" | "video" | "watch"; // keep alias

export const categoryStore = {
  async getAll() {
    const all = await prisma.category.findMany();
    return {
      blog: all.filter((cat) => cat.type === "blog"),
      video: all.filter((cat) => cat.type === "video" || cat.type === "watch"),
    };
  },

  async getByType(type: CategorySection) {
    const target = type === "watch" ? "video" : type;
    return prisma.category.findMany({
      where: { type: target, isActive: true },
      orderBy: { order: "asc" },
    });
  },

  async getBySlug(type: CategorySection, slug: string) {
    const target = type === "watch" ? "video" : type;
    return prisma.category.findFirst({
      where: { type: target, slug },
    });
  },

  async getByAccessibleLabel(type: CategorySection, label: string) {
    const target = type === "watch" ? "video" : type;
    return prisma.category.findFirst({
      where: { type: target, accessibleLabel: label },
    });
  },

  async create(type: CategorySection, category) {
    const target = type === "watch" ? "video" : type;
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });
    if (existing) throw new Error(`Category with slug "${category.slug}" already exists`);

    const count = await prisma.category.count({ where: { type: target } });

    return prisma.category.create({
      data: {
        ...category,
        type: target,
        order: count,
        isActive: true,
      },
    });
  },

  async update(type: CategorySection, slug: string, updates) {
    const target = type === "watch" ? "video" : type;
    const existing = await prisma.category.findFirst({
      where: { slug, type: target },
    });
    if (!existing) throw new Error(`Category with slug "${slug}" not found`);

    return prisma.category.update({
      where: { id: existing.id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  },

  async delete(type: CategorySection, slug: string) {
    const target = type === "watch" ? "video" : type;
    const existing = await prisma.category.findFirst({
      where: { slug, type: target },
    });
    if (!existing) throw new Error(`Category with slug "${slug}" not found`);
    await prisma.category.delete({ where: { id: existing.id } });
  },

  async reorder(type: CategorySection, slugs: string[]) {
    const target = type === "watch" ? "video" : type;
    await Promise.all(
      slugs.map((slug, index) =>
        prisma.category.updateMany({
          where: { slug, type: target },
          data: { order: index },
        })
      )
    );
  },
};