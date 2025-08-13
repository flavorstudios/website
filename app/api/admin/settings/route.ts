import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { getAdminDb } from "@/lib/firebase-admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const session = await getSessionInfo(request)
  if (!session || !(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const db = getAdminDb()
    const doc = await db.collection("adminSettings").doc(session.uid).get()
    return NextResponse.json({ settings: doc.exists ? doc.data() : {} })
  } catch (err) {
    console.error("Failed to fetch settings", err)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionInfo(request)
  if (!session || !(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const payload = await request.json()
    const db = getAdminDb()
    await db.collection("adminSettings").doc(session.uid).set(payload, { merge: true })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Failed to save settings", err)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}