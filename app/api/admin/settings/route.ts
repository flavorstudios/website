import { requireAdmin, getSessionInfo } from "@/lib/admin-auth"
import { ADMIN_BYPASS, adminDb } from "@/lib/firebase-admin"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  if (ADMIN_BYPASS || !adminDb) {
    return NextResponse.json({ settings: {} })
  }

  const session = await getSessionInfo(request)
  if (!session || !(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const doc = await adminDb
      .collection("adminSettings")
      .doc(session.uid)
      .get()
    return NextResponse.json({ settings: doc.exists ? doc.data() : {} })
  } catch (err) {
    console.error("Failed to fetch settings", err)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (ADMIN_BYPASS || !adminDb) {
    return NextResponse.json({ success: true })
  }

  const session = await getSessionInfo(request)
  if (!session || !(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const payload = await request.json()
    await adminDb
      .collection("adminSettings")
      .doc(session.uid)
      .set(payload, { merge: true })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Failed to save settings", err)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}