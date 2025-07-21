import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { categoryStore } from "@/lib/category-store";
import { adminDb } from "@/lib/firebase-admin";

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids, type } = await request.json();
    if (!Array.isArray(ids) || !["blog", "video"].includes(type)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await categoryStore.reorder(ids, type);

    const batch = adminDb.batch();
    ids.forEach((id: string, index: number) => {
      const ref = adminDb.collection("categories").doc(id);
      batch.set(ref, { order: index }, { merge: true });
    });
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder categories:", error);
    return NextResponse.json(
      { error: "Failed to reorder categories" },
      { status: 500 }
    );
  }
}
