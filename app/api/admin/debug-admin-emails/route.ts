import { NextResponse } from "next/server";
import { getAllowedAdminEmails } from "@/lib/firebase-admin";
import { serverEnv } from "@/env/server";

// Endpoint to expose allowed admin emails when DEBUG_ADMIN is enabled.
// Use this to verify environment configuration during deployments.
export function GET() {
  if (serverEnv.DEBUG_ADMIN !== "true") {
    return NextResponse.json({}, { status: 401 });
  }

  return NextResponse.json({ emails: getAllowedAdminEmails() });
}