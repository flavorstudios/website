import { NextResponse } from "next/server";
import { getAllowedAdminEmails } from "@/lib/firebase-admin";
import { requireAdminAction } from "@/lib/admin-auth";

// Only allow authenticated admins to access
export async function GET() {
  // Protect this endpoint so only logged-in admins get the list
  if (!(await requireAdminAction())) {
    return NextResponse.json({ addresses: [] }, { status: 401 });
  }
  // Return the allowed admin email addresses from environment config
  return NextResponse.json({ addresses: getAllowedAdminEmails() });
}
