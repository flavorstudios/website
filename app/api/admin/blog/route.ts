import { type NextRequest, NextResponse } from "next/server"
import { addDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/firebase/config"

export async function POST(request: NextRequest) {
  try {
    const blogData = await request.json()

    // Generate ID if creating new post
    const id = blogData.id || `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const post = {
      ...blogData,
      id,
      createdAt: blogData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: blogData.views || 0,
    }

    // Save to Firestore
    const docRef = await addDoc(collection(db, "blogs"), post)

    console.log("Blog post saved:", post)

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Blog post saved successfully",
    })
  } catch (error) {
    console.error("Error saving blog post:", error)
    return NextResponse.json({ error: "Failed to save blog post" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch from Firestore
    const querySnapshot = await getDocs(collection(db, "blogs"))
    const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
