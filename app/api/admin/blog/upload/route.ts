import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File
    const folder = (formData.get("folder") as string) || "blogImages"

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // TODO: Upload to Firebase Storage
    // const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`)
    // const snapshot = await uploadBytes(storageRef, file)
    // const url = await getDownloadURL(snapshot.ref)

    // For now, return a placeholder URL
    const url = `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(file.name)}`

    return NextResponse.json({
      success: true,
      url,
      message: "Image uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
