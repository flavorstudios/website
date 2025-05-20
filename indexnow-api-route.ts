import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "IndexNow endpoint is active.",
    usage: "Use /app/actions/indexnow-actions.ts to trigger submissions"
  });
}
