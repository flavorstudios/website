import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Clock } from "lucide-react";
import CommentSection from "./components/comment-section";
import SocialShare from "./components/social-share";
import { getMetadata } from "@/lib/seo-utils";

async function getBlogPost(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/blogs`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const posts = data.posts || [];
    return posts.find((post: any) => post.slug === slug && post.status === "published") || null;
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return null;
  }
}

interface BlogPostPageProps {
  params: { slug: string };
}

// --- CLEAN CENTRALIZED SEO METADATA (OG, Twitter, Schema) ---
export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found – Flavor Studios",
      description: "This blog post could not be found.",
      alternates: {
        canonical: `https://flavorstudios.in/blog/${params.slug}`,
      },
    };
  }

  const canonicalUrl = `https://flavorstudios.in/blog/${post.slug}`;
  const ogImage = post.coverImage || "https://flavorstudios.in/cover.jpg";
  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;

  return getMetadata({
    title: `${seoTitle} – Flavor Studios`,
    description: seoDescription,
    path: `/blog/${post.slug}`,
    ogImage,
    schema: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: seoTitle,
      description: seoDescription,
      image: ogImage,
      author: {
        "@type": "Person",
        name: post.author || "Flavor Studios",
      },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      publisher: {
        "@type": "Organization",
        name: "Flavor Studios",
        logo: {
          "@type": "ImageObject",
          url: "https://flavorstudios.in/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
    },
    // robots: "index, follow" // optional, uncomment if needed
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{post.category}</Badge>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {post.author && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views?.toLocaleString() ?? 0} views
            </span>
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.coverImage && (
          <div className="mb-8">
            <img
              src={post.coverImage || "/placeholder.svg?height=400&width=800&text=Blog+Post+Cover"}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>

        {/* Social Share */}
        <SocialShare
          title={post.title}
          excerpt={post.excerpt}
          url={`https://flavorstudios.in/blog/${post.slug}`}
          image={post.coverImage}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comment Section */}
        <CommentSection postId={post.id} postSlug={post.slug} />
      </article>
    </div>
  );
}
