import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const categories = [
  { name: "Anime News", slug: "anime-news" },
  { name: "Studio Originals", slug: "studio-originals" },
  { name: "Behind the Scenes", slug: "behind-the-scenes" },
  { name: "Tutorials", slug: "tutorials" },
  { name: "Reviews", slug: "reviews" },
  { name: "Inspiration & Life", slug: "inspiration-life" },
  { name: "Industry Insights", slug: "industry-insights" },
  { name: "Community & Events", slug: "community-events" },
  { name: "Interviews", slug: "interviews" },
]

async function main() {
  for (const type of ["blog", "video"]) {
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: type === "blog" ? category.slug : category.slug + "-video" },
        update: {},
        create: {
          name: category.name,
          slug: type === "blog" ? category.slug : category.slug + "-video",
          type,
        },
      })
    }
  }
  console.log("✅ Categories seeded!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })