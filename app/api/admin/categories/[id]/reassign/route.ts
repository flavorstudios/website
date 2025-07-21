import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { categoryStore } from "@/lib/category-store";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newCategoryId } = await request.json();
    if (!newCategoryId) {
      return NextResponse.json({ error: "Missing target category" }, { status: 400 });
    }

    const oldCategory = await categoryStore.getById(params.id);
    const newCategory = await categoryStore.getById(newCategoryId);
    if (!oldCategory || !newCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const batch = adminDb.batch();
    const blogs = await adminDb
      .collection("blogs")
      .where("category", "==", oldCategory.slug)
      .get();
    blogs.forEach((doc) => batch.set(doc.ref, { category: newCategory.slug }, { merge: true }));
    const videos = await adminDb
      .collection("videos")
      .where("category", "==", oldCategory.slug)
      .get();
    videos.forEach((doc) => batch.set(doc.ref, { category: newCategory.slug }, { merge: true }));
    batch.delete(adminDb.collection("categories").doc(oldCategory.id));
    await batch.commit();

    await categoryStore.delete(oldCategory.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reassign category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
