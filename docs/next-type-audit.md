# Next.js 15.4.6 Type Validation Audit

## Section 1 — Summary
- Vercel successfully compiles the app, but the build fails during the TypeScript validation pass.
- The dynamic page `app/(marketing)/blog/[slug]/page.tsx` receives plain-object params at runtime, yet its props are checked against a promise-based constraint.
- The project will normalize its shared helper so page components see object params/searchParams even if Next's declarations advertise promises.
- Dynamic API routes must retain `params: Promise<...>` and `await` the value because the route validator enforces that signature.
- Environment variable warnings in the logs are informational and not responsible for the failure.

## Section 2 — Root cause (pages)
The local helper forwards Next's generated `PageProps`, which in this release advertises `Promise`-wrapped values. The project code, however, uses the object shape that Next passes at runtime:

```ts
// types/next.ts
export type PageProps<
  Params extends Record<string, string | string[] | undefined> = Record<string, never>,
  Search extends
    | Record<string, string | string[] | undefined>
    | undefined = Record<string, string | string[] | undefined>,
> = NextPageProps<Params, Search>;
```

Although the repo augments `next` in `types/next-app.d.ts`, the generated `.d.ts` still constrains `PageProps` to the promise-based signature, so any page using the object form fails the constraint check.

## Section 3 — Fix 1 (local, failing page)
### Option A — conform to generated types (quick unblock)
⚠️ **Temporary only.** This mirrors the generated declaration but keeps the mismatch in place.
```ts
import { notFound } from "next/navigation";
import type { PageProps } from "@/types/next";

type BlogPostPageProps = PageProps<Promise<{ slug: string }>>;

type BlogPostGenerateMetadataProps = PageProps<Promise<{ slug: string }>>;

export async function generateMetadata({ params }: BlogPostGenerateMetadataProps) {
  const { slug } = await params;
  ...
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  ...
}
```

### Option B — keep runtime-accurate params (recommended with global fix)
```ts
import { notFound } from "next/navigation";

type BlogPostPageProps = {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = params;
  ...
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  ...
}
```
Option B matches the values Next provides at runtime and becomes valid once the shared type (Section 4) unwraps promises.

#### Full file — `app/(marketing)/blog/[slug]/page.tsx`
```ts
// app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { getMetadata, getCanonicalUrl, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import BlogRenderer from "@/components/blog/BlogRenderer";
import SimpleBlogFallback from "@/components/blog/SimpleBlogFallback";
import { sanitizeHtmlServer } from "@/lib/sanitize/server";
import { getBlogPost } from "@/lib/blog";
// ⬇️ Use shared public type instead of declaring locally!
import type { PublicBlogDetail } from "@/lib/types";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
};

type BlogPostGenerateMetadataProps = BlogPostPageProps;

// SEO metadata (dynamic per post, using Next.js generateMetadata API)
export async function generateMetadata({ params }: BlogPostGenerateMetadataProps) {
  const { slug } = params;
  let post: PublicBlogDetail | null = null;
  try {
    post = await getBlogPost(slug);
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }

  // Fallback metadata for posts not found or not published (noindex, follow)
  if (!post) {
    const fallbackTitle = `Post Not Found – ${SITE_NAME}`;
    const fallbackDescription = `Sorry, this blog post could not be found. Explore more inspiring anime blog posts at ${SITE_NAME}.`;
    const fallbackImage = `${SITE_URL}/cover.jpg`;

    return getMetadata({
      title: fallbackTitle,
      description: fallbackDescription,
      path: `/blog/${slug}`,
      robots: "noindex, follow",
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: getCanonicalUrl(`/blog/${slug}`),
        type: "article",
        images: [{ url: fallbackImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        site: SITE_BRAND_TWITTER,
        creator: SITE_BRAND_TWITTER,
        title: fallbackTitle,
        description: fallbackDescription,
        images: [fallbackImage],
      },
    });
  }

  // --- Codex fix: use featuredImage consistently ---
  const ogImage =
    post.openGraphImage ||
    post.featuredImage ||
    SITE_DEFAULT_IMAGE;

  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;
  const schemaType = post.schemaType || "Article";

  return getMetadata({
    title: `${seoTitle} – ${SITE_NAME}`,
    description: seoDescription,
    path: `/blog/${post.slug}`,
    robots: "index,follow",
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: schemaType,
      title: seoTitle,
      description: seoDescription,
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_BRAND_TWITTER,
      creator: SITE_BRAND_TWITTER,
      images: [ogImage],
      title: seoTitle,
      description: seoDescription,
    },
  });
}

// Main BlogPost page (server component)
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  let post: PublicBlogDetail | null = null;
  try {
    post = await getBlogPost(slug);
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }

  // If post is not found or not published, trigger Next.js not-found page.
  if (!post) notFound();

  const contentHtml = (post as { contentHtml?: unknown }).contentHtml;
  const hasContentHtml =
    typeof contentHtml === "string" && contentHtml.trim().length > 0;
  const hasContentString =
    typeof post.content === "string" && post.content.trim().length > 0;
  const bodyContent = (post as { body?: unknown }).body;
  const hasBodyString =
    typeof bodyContent === "string" && bodyContent.trim().length > 0;

  const hasRenderableContent = hasContentHtml || hasContentString || hasBodyString;

  // --- Codex fix: use featuredImage consistently ---
  const articleSchema = getSchema({
    type: post.schemaType || "Article",
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.openGraphImage || post.featuredImage || SITE_DEFAULT_IMAGE,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author:
      post.author === SITE_NAME
        ? { "@type": "Organization", name: SITE_NAME }
        : { "@type": "Person", name: post.author || SITE_NAME },
    headline: post.title,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Inject Article schema (for Google/SEO) --- */}
      <StructuredData schema={articleSchema} />
      {/* --- Blog Post Renderer (unified) --- */}
      {hasRenderableContent ? (
        <BlogRenderer post={post} sanitizeHtml={sanitizeHtmlServer} />
      ) : (
        <SimpleBlogFallback
          title={post.title ?? "Blog post"}
          excerpt={
            post.excerpt ||
            (typeof (post as { description?: string }).description === "string"
              ? (post as { description?: string }).description
              : undefined)
          }
          coverImage={post.openGraphImage || post.featuredImage}
          publishedAt={post.publishedAt || post.createdAt}
          author={
            typeof post.author === "string"
              ? post.author
              : (post.author as { name?: string } | undefined)?.name
          }
        />
      )}
    </div>
  );
}
```

## Section 4 — Fix 2 (global, pages)
Normalize the shared helper so it unwraps whatever Next declares:

```ts
// types/next.ts
import type { PageProps as NextPageProps } from "next";

type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

type DefaultSearch = {
  [key: string]: string | string[] | undefined;
};

export type PageProps<
  Params = Record<string, never>,
  Search extends DefaultSearch | undefined = DefaultSearch,
> = {
  params: UnwrapPromise<NextPageProps<Params, Search>["params"]>;
  searchParams?: UnwrapPromise<NextPageProps<Params, Search>["searchParams"]>;
};

export type SearchParams<T extends DefaultSearch = DefaultSearch> =
  PageProps<Record<string, never>, T>["searchParams"];
```

This keeps app code object-first while remaining compatible with promise-heavy generated definitions.

After changing the shared type, re-run `pnpm build` on Vercel — the same error on `app/(marketing)/blog/[slug]/page.tsx` should disappear.

#### Full file — `types/next.ts`
```ts
import type { PageProps as NextPageProps } from "next";

type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

type DefaultSearchParams = {
  [key: string]: string | string[] | undefined;
};

export type PageProps<
  Params = Record<string, never>,
  Search extends DefaultSearchParams | undefined = DefaultSearchParams,
> = {
  params: UnwrapPromise<NextPageProps<Params, Search>["params"]>;
  searchParams?: UnwrapPromise<NextPageProps<Params, Search>["searchParams"]>;
};

export type SearchParams<
  T extends DefaultSearchParams = DefaultSearchParams,
> = PageProps<Record<string, never>, T>["searchParams"];
```

## Section 5 — Root cause (API routes)
Earlier builds showed the same mismatch for dynamic API routes that destructure `{ params }` as an object:

```ts
export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  const { uid } = params; // <- promise expected in Next 15.4.6
  ...
}
```

## Section 6 — Fix 3 (local, API route)
```ts
// app/api/admin/audit-logs/[uid]/route.ts
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;
  ...
}
```

## Section 7 — Fix 4 (global, API routes)
Provide a helper that encodes the awaited contract once and reuse it everywhere:

```ts
// types/route.ts
export type RouteContext<
  Params extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> = {
  params: Promise<Params>;
};
```

Then consume it in dynamic handlers:

```ts
import type { RouteContext } from "@/types/route";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<{ uid: string }>
) {
  const { uid } = await params;
  ...
}
```

## Section 8 — Files to review next
Search for these patterns and update the signatures accordingly:
- `app/(marketing)/` + `[` (dynamic segments in marketing routes)
- `app/**/[slug]/page.tsx`
- `app/**/[id]/page.tsx`
- `app/**/[...slug]/page.tsx`
- `app/api/**/[`
- `params:`
- `searchParams?: unknown`
- `export async function GET(`

## Section 9 — Notes for Vercel CI
- The build output already shows `✓ Compiled successfully`; only type validation fails.
- Missing optional environment variables are informational and unrelated.
- Once page props unwrap promises (Section 4) and dynamic route handlers await `params` (Sections 6–7), Vercel’s type check will accept the project.