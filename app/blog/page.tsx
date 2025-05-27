import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog - Anime Insights & Animation Stories",
  description:
    "Read our latest blog posts about anime, animation techniques, storytelling, and behind-the-scenes content from Flavor Studios. Discover insights into our creative process.",
  openGraph: {
    title: "Blog - Anime Insights & Animation Stories | Flavor Studios",
    description: "Read our latest blog posts about anime, animation techniques, and storytelling from Flavor Studios.",
    type: "website",
    url: "https://flavorstudios.in/blog",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Anime Insights & Animation Stories | Flavor Studios",
    description: "Read our latest blog posts about anime, animation techniques, and storytelling from Flavor Studios.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://flavorstudios.in/blog",
  },
}

const BlogPage = () => {
  return (
    <div>
      <h1>Blog</h1>
      <p>Welcome to the blog!</p>
    </div>
  )
}

export default BlogPage
