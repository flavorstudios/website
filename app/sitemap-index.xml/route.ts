// app/sitemap.xml/route.ts (Sitemap Index Route)

import { NextResponse } from "next/server";
import { getCanonicalUrl } from "@/lib/seo-utils";
// import { SITE_URL } from "@/lib/constants";
// import { categoryStore } from "@/lib/category-store"; // Uncomment if/when category sitemaps go live

// Optional: Type for categories, in case you expand to dynamic category sitemaps
// interface Category {
//   slug?: string;
//   name: string;
//   updatedAt?: string;
//   createdAt?: string;
//   published?: boolean;
// }

export async function GET(): Promise<NextResponse> {
  try {
    // --- Optionally fetch category sitemaps ---
    // const categories = await categoryStore.getAll().catch(() => []);
    // const categorySitemaps =
    //   Array.isArray(categories) && categories.length > 0
    //     ? categories
    //         .filter((cat) => cat.published !== false)
    //         .map((category) => {
    //           const slug =
    //             category.slug ||
    //             category.name
    //               .toLowerCase()
    //               .replace(/\s+/g, "-")
    //               .replace(/[^a-z0-9\-]/g, "");
    //           return {
    //             url: getCanonicalUrl(`/category/${slug}/sitemap.xml`),
    //             lastModified: new Date(category.updatedAt || category.createdAt || Date.now()).toISOString(),
    //           };
    //         })
    //     : [];

    // Always include the main sitemaps
    const sitemaps = [
      {
        url: getCanonicalUrl("/sitemap.xml"),
        lastModified: new Date().toISOString(),
      },
      {
        url: getCanonicalUrl("/blog/sitemap.xml"),
        lastModified: new Date().toISOString(),
      },
      {
        url: getCanonicalUrl("/watch/sitemap.xml"),
        lastModified: new Date().toISOString(),
      },
      // ...(categorySitemaps || []), // Enable when category sitemaps are live
    ];

    // Deduplicate URLs just in case
    const seen = new Set<string>();
    const dedupedSitemaps = sitemaps.filter((sm) => {
      if (seen.has(sm.url)) return false;
      seen.add(sm.url);
      return true;
    });

    // XML sitemap index string (canonical URLs only)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${dedupedSitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${sitemap.lastModified}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // 1 hour cache, can serve stale while revalidating for up to a day
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating sitemap index:", error);

    // Fallback: at least return main sitemap
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${getCanonicalUrl("/sitemap.xml")}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  }
}
