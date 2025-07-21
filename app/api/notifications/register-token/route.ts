import { NextRequest, NextResponse } from "next/server"

// Replace this with your actual database save logic as needed.
async function saveTokenToDatabase(token: string) {
  // Example: Write token to a file for demo, replace with your actual storage!
  // await fs.promises.appendFile("fcm_tokens.txt", token + "\n")
  // For Firestore: await firestore.collection('fcm_tokens').add({ token })
  return true
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 400 })

    // Save to your storage
    await saveTokenToDatabase(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save token" }, { status: 500 })
  }
}
