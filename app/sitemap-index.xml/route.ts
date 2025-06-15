// app/sitemap-index.xml/route.ts

import { type NextRequest, NextResponse } from "next/server";
// import { categoryStore } from "@/lib/category-store"; // Uncomment when dynamic category sitemaps are ready

const BASE_URL = "https://flavorstudios.in";

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // Uncomment for future: Category-specific sitemaps
    // const categories = await categoryStore.getAll();
    // const categorySitemaps = Object.values(categories)
    //   .flat()
    //   .map((category: any) => ({
    //     url: `${BASE_URL}/category/${category.slug}/sitemap.xml`,
    //     lastModified: new Date(category.updatedAt || category.createdAt || new Date()),
    //   }));

    // Core sitemaps—update or expand if new sections added!
    const sitemaps = [
      { url: `${BASE_URL}/sitemap.xml`, lastModified: new Date() },
      { url: `${BASE_URL}/blog/sitemap.xml`, lastModified: new Date() },
      { url: `${BASE_URL}/watch/sitemap.xml`, lastModified: new Date() },
      // ...(categorySitemaps || []), // Enable when categories sitemaps exist
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${sitemap.lastModified.toISOString()}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap index:", error);

    // Fallback: Just the main sitemap
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  }
}