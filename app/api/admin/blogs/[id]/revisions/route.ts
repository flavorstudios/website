import { requireAdmin, getSessionAndRole } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { blogStore } from "@/lib/content-store"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = params
  const revisions = await blogStore.getRevisions(id)
  return NextResponse.json({ revisions })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { revisionId } = await request.json()
  const session = await getSessionAndRole(request)
  const { id } = params
  const post = await blogStore.restoreRevision(
    id,
    revisionId,
    session?.email || "unknown",
  )
  if (!post) {
    return NextResponse.json({ error: "Revision not found" }, { status: 404 })
  }
  return NextResponse.json(post)
}
