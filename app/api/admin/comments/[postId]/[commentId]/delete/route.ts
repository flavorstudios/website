// app/api/admin/comments/[slug]/[id]/delete/route.ts

import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// DELETE /api/admin/comments/[slug]/[id]/delete
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  context: { params: Promise<{ slug: string; id: string }> }
  try {
    const db = getAdminDb();
    const entryRef = db
      .collection("comments")
      .doc(slug)
      .collection("entries")
      .doc(id);

    await entryRef.delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE_COMMENT]", err);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
