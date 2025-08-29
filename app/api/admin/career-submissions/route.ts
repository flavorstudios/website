import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"

interface Submission {
  [key: string]: unknown
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canHandleContacts"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const db = getAdminDb()
    const snap = await db
      .collection("careerSubmissions")
      .orderBy("createdAt", "desc")
      .get()
    const submissions = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Submission),
    }))
    return NextResponse.json({ submissions })
  } catch (err) {
    console.error("[CAREER_SUBMISSIONS_GET]", err)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}