import { blogCategories } from "@/lib/blogCategories";
import { notFound } from "next/navigation";

export default async function BlogCategoryPage({ params }: { params: { category: string } }) {
  // params is now safe to use, even if async in the future
  const category = blogCategories[params.category];
  if (!category) return notFound();

  return (
    <section className="container py-16">
      <h1 className="text-4xl font-bold mb-4">{category.heading}</h1>
      <p className="text-lg text-muted-foreground max-w-3xl">{category.intro}</p>
    </section>
  );
}
