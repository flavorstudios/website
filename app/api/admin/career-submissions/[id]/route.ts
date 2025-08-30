import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"

interface Submission {
  [key: string]: unknown
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!(await requireAdmin(request, "canHandleContacts"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = context.params
  try {
    const body = await request.json()
    const allowed = [
      "reviewed",
      "status",
      "tags",
      "notes",
      "interviewAt",
      "rating",
      "favorite",
    ]
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) {
        updates[key] = body[key]
      }
    }
    const db = getAdminDb()
    await db.collection("careerSubmissions").doc(id).update(updates)
    const doc = await db.collection("careerSubmissions").doc(id).get()
    return NextResponse.json({
      submission: { id: doc.id, ...(doc.data() as Submission) },
    })
  } catch (err) {
    console.error("[CAREER_SUBMISSIONS_PUT]", err)
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    )
  }
}