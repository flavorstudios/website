import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const {
      firstName = "",
      lastName = "",
      email = "",
      skills = "",
      portfolio = "",
      message = "",
    } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const data = {
      firstName,
      lastName,
      email,
      skills,
      portfolio,
      message,
      createdAt: new Date().toISOString(),
      reviewed: false,
    };

    const ref = adminDb.collection("careerSubmissions").doc();
    await ref.set({ id: ref.id, ...data });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CAREER_SUBMISSION_ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}