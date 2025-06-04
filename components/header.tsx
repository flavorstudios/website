import Link from "next/link"
import { getCategoriesWithFallback } from "@/lib/dynamic-categories"

export async function Header() {
  const { blogCategories, videoCategories } = await getCategoriesWithFallback()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center gap-6 px-4 py-4">
        <Link href="/" className="font-bold text-xl">Flavor Studios</Link>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href="/blog">Blog</Link>
          {blogCategories.slice(0, 3).map((cat) => (
            <Link key={cat.slug} href={`/blog?category=${cat.slug}`}>{cat.name}</Link>
          ))}
          <Link href="/watch">Watch</Link>
          {videoCategories.slice(0, 3).map((cat) => (
            <Link key={cat.slug} href={`/watch?category=${cat.slug}`}>{cat.name}</Link>
          ))}
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}
