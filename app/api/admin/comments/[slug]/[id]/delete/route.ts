// app/api/admin/comments/[slug]/[id]/delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// DELETE /api/admin/comments/[slug]/[id]/delete
export async function DELETE(req: NextRequest, { params }: { params: { slug: string, id: string } }) {
  const { slug, id } = params;
  try {
    const entryRef = adminDb
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
