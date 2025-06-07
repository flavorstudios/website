import { NextResponse } from "next/server"

const BASE_URL = "https://flavorstudios.in"

export async function GET() {
  const content = `
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /test/
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/blog/sitemap.xml
Sitemap: ${BASE_URL}/watch/sitemap.xml
`

  return new NextResponse(content.trim(), {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
