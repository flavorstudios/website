import { requireAdmin } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import { initializeSampleData } from "@/lib/sample-data";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await initializeSampleData();
    return NextResponse.json({ success: true, message: "Data initialized successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to initialize data" }, { status: 500 });
  }
}
