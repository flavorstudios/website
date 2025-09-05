import { NextResponse } from "next/server";
import { getAllowedAdminEmails } from "@/lib/firebase-admin";
import { serverEnv } from "@/env/server";

export function GET() {
  if (serverEnv.DEBUG_ADMIN !== "true") {
    return NextResponse.json({}, { status: 401 });
  }

  return NextResponse.json({ emails: getAllowedAdminEmails() });
}