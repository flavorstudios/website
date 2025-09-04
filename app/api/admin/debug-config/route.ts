import { NextResponse } from "next/server";
import { serverEnv } from "@/env/server";
import { isAdminSdkAvailable, getAllowedAdminEmails } from "@/lib/firebase-admin";

export function GET() {
  if (serverEnv.DEBUG_ADMIN !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    adminSdk: isAdminSdkAvailable(),
    emails: getAllowedAdminEmails(),
  });
}