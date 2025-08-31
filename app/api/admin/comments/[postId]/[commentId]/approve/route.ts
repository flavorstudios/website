// app/api/admin/comments/[slug]/[id]/approve/route.ts

import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// PATCH /api/admin/comments/[slug]/[id]/approve
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { slug, id } = await context.params;
  try {
    const db = getAdminDb();
    const entryRef = db
      .collection("comments")
      .doc(slug)
      .collection("entries")
      .doc(id);

    await entryRef.update({ flagged: false });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[APPROVE_COMMENT]", err);
    return NextResponse.json({ error: "Failed to approve comment" }, { status: 500 });
  }
}

