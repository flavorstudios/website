import { blogCategories } from "@/lib/blogCategories"
import { notFound } from "next/navigation"

export default function BlogCategoryPage({ params }: { params: { category: string } }) {
  const category = blogCategories[params.category]
  if (!category) return notFound()

  return (
    <section className="container py-16">
      <h1 className="text-4xl font-bold mb-4">{category.heading}</h1>
      <p className="text-lg text-muted-foreground max-w-3xl">{category.intro}</p>
    </section>
  )
}
