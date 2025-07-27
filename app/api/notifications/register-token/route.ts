import { NextRequest, NextResponse } from "next/server";
// import { firestore } from "@/lib/firebase"; // Uncomment if using Firestore

// Lint-proof: Reference unused variable with void
async function saveTokenToDatabase(_token: string) {
  void _token; // Silences the unused variable lint error!
  // Example: await firestore.collection('fcm_tokens').add({ token: _token });
  // For demo, just return true
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    // Save to your storage
    await saveTokenToDatabase(token);

    return NextResponse.json({ success: true });
  } catch (_error) {
    void _error; // Silences the unused variable lint error!
    // Optionally: console.error(_error);
    return NextResponse.json({ error: "Failed to save token" }, { status: 500 });
  }
}
