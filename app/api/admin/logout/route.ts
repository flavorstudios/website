// app/api/admin/logout/route.ts

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  // Remove the admin-session cookie
  const res = NextResponse.json({ ok: true, message: "Logged out" })
  res.cookies.set("admin-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
  return res
}
