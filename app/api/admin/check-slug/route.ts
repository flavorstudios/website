import { requireAdmin } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store";
import { logError } from "@/lib/log";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const existing = await blogStore.getBySlug(slug);
    const available = !existing || existing.id === id;

    return NextResponse.json({ available });
  } catch (err) {
    logError("check-slug", err);
    return NextResponse.json({ error: "Failed to check slug" }, { status: 500 });
  }
}