import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch from Firestore
    // const querySnapshot = await getDocs(collection(db, 'blogCategories'))
    // const categories = querySnapshot.docs.map(doc => doc.data().name)

    // Fallback categories
    const categories = [
      "Anime Reviews",
      "Behind the Scenes",
      "Tutorials & Guides",
      "News & Updates",
      "Creator Spotlights",
      "Industry Insights",
    ]

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
