// app/api/admin/comments/[slug]/[id]/approve/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// PATCH /api/admin/comments/[slug]/[id]/approve
export async function PATCH(req: NextRequest, { params }: { params: { slug: string, id: string } }) {
  const { slug, id } = params;
  try {
    const entryRef = adminDb
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
