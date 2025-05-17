import { type NextRequest } from "next/server"
import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"

/**
 * Dynamic image optimization API route
 *
 * Query parameters:
 * - image: path of the image from /public/ (required)
 * - w: desired width (default 1280)
 * - q: desired quality (default 80)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const image = searchParams.get("image")
  const width = Number.parseInt(searchParams.get("w") || "1280")
  const quality = Number.parseInt(searchParams.get("q") || "80")

  if (!image) {
    return new Response(JSON.stringify({ error: "Missing image" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const normalizedImagePath = path.normalize(image).replace(/^(\.\.(\/|\\|$))+/, "")
  const imagePath = path.join(process.cwd(), "public", normalizedImagePath)

  try {
    const file = await fs.readFile(imagePath)

    const optimized = await sharp(file)
      .resize({ width, withoutEnlargement: true })
      .toFormat("webp", { quality })
      .toBuffer()

    return new Response(optimized, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        Vary: "Accept",
      },
    })
  } catch (error) {
    console.error("Image optimization error:", error)

    const status =
      (error as NodeJS.ErrnoException).code === "ENOENT" ? 404 : 500
    const message =
      status === 404
        ? "Image not found or unreadable"
        : `Image processing error: ${(error as Error).message}`

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  }
}
