import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

interface Submission {
  [key: string]: unknown
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request, "canHandleContacts"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  try {
    const { reviewed } = await request.json()
    await adminDb
      .collection("careerSubmissions")
      .doc(id)
      .update({ reviewed: !!reviewed })
    const doc = await adminDb.collection("careerSubmissions").doc(id).get()
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