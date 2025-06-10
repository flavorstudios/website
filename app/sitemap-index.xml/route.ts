import { type NextRequest, NextResponse } from "next/server";
import { categoryStore } from "@/lib/category-store";

const BASE_URL = "https://flavorstudios.in";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // To include category sitemaps in the index, uncomment below:
    // const categories = await categoryStore.getAll();
    // const categorySitemaps = categories.map((category: any) => {
    //   const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, "-");
    //   return {
    //     url: `${BASE_URL}/category/${slug}/sitemap.xml`,
    //     lastModified: new Date(category.updatedAt || category.createdAt || new Date()),
    //   };
    // });

    // Main sitemaps (always present)
    const sitemaps = [
      { url: `${BASE_URL}/sitemap.xml`, lastModified: new Date() },
      { url: `${BASE_URL}/blog/sitemap.xml`, lastModified: new Date() },
      { url: `${BASE_URL}/watch/sitemap.xml`, lastModified: new Date() },
      // ...(categorySitemaps || []) // Uncomment if/when category sitemaps exist!
    ];

    // Build sitemap index XML
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

    // Fallback: only main sitemap
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
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }
}
