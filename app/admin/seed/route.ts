import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  // Protect this route: only allow if admin session is valid
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json(
    {
      error:
        "Sample content seeding has been disabled. Manage site content through the standard admin tools.",
    },
    { status: 410 }
  )
}
