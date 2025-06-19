// scripts/init-categories.ts
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "content-data", "categories.json");

async function main() {
  const raw = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw);

  const all = [
    { type: "blog", categories: parsed.blog || [] },
    { type: "video", categories: parsed.video || parsed.watch || [] },
  ];

  for (const { type, categories } of all) {
    for (const category of categories) {
      const exists = await prisma.category.findUnique({ where: { slug: category.slug } });

      if (!exists) {
        await prisma.category.create({
          data: {
            type,
            slug: category.slug,
            title: category.title,
            description: category.description,
            menuDescription: category.tooltip || category.description,
            accessibleLabel: category.accessibleLabel || category.title,
            icon: category.icon || null,
            order: category.order ?? 0,
            isActive: category.isActive ?? true,
            postCount: category.postCount ?? 0,
            metaTitle: category.metaTitle,
            metaDescription: category.metaDescription,
            canonicalUrl: category.canonicalUrl,
            robots: category.robots ?? null,
            ogTitle: category.ogTitle,
            ogDescription: category.ogDescription,
            ogUrl: category.ogUrl,
            ogType: category.ogType,
            ogSiteName: category.ogSiteName,
            ogImages: category.ogImages,
            twitterCard: category.twitterCard,
            twitterSite: category.twitterSite,
            twitterTitle: category.twitterTitle,
            twitterDescription: category.twitterDescription,
            twitterImages: category.twitterImages,
            schema: category.schema,
          },
        });
        console.log(`✅ Created: ${category.slug}`);
      } else {
        console.log(`⚠️ Skipped (already exists): ${category.slug}`);
      }
    }
  }

  console.log("✅ All categories imported into Prisma.");
}

main().catch((err) => {
  console.error("❌ Failed to seed categories:", err);
  process.exit(1);
});