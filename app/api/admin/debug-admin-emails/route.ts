import { NextResponse } from "next/server";

// Endpoint to expose admin emails when DEBUG_ADMIN is enabled.
// Use this to verify environment configuration during deployments.
export function GET() {
  if (process.env.DEBUG_ADMIN !== "true") {
    return NextResponse.json({}, { status: 401 });
  }

  const envEmails = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  const adminEmails = envEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return NextResponse.json({ adminEmails });
}