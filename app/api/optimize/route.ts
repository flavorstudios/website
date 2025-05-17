import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"

/**
 * Dynamic image optimization API route
 *
 * @param req - The incoming request
 * @returns Optimized image as WebP or error response
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

  // Validate required parameters
  if (!image) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 })
  }

  // Ensure the image path is safe and within the public directory
  const normalizedImagePath = path.normalize(image).replace(/^(\.\.(\/|\\|$))+/, "")
  const imagePath = path.join(process.cwd(), "public", normalizedImagePath)

  try {
    // Read the original image file
    const file = await fs.readFile(imagePath)

    // Process the image with Sharp
    const optimized = await sharp(file)
      .resize({ width, withoutEnlargement: true }) // Prevent upscaling
      .toFormat("webp", { quality })
      .toBuffer()

    // Return the optimized image with appropriate headers
    return new Response(optimized, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        Vary: "Accept",
      },
    })
  } catch (error) {
    console.error("Image optimization error:", error)

    // Return appropriate error response
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Image not found or unreadable" }, { status: 404 })
    }

    return NextResponse.json({ error: `Image processing error: ${(error as Error).message}` }, { status: 500 })
  }
}
