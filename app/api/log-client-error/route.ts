import { NextResponse } from "next/server"
import { serverEnv } from "@/env/server"

export async function POST(req: Request) {
  try {
    const { error, stack } = await req.json()
    // In production, log on the server
    if (serverEnv.NODE_ENV === "production") {
      console.error("Client error:", error, stack)
    } else {
      console.error("Client error:", error, stack)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("log-client-error: failed", err)
    return NextResponse.json({ success: false }, { status: 400 })
  }
}