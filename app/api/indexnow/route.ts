import { NextResponse } from "next/server";
import { serverEnv } from "@/env/server";

// Use env variable, no hardcoded key
const INDEXNOW_KEY = serverEnv.INDEXNOW_KEY;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "Missing URL in request body" }, { status: 400 });
  }
  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: "IndexNow key missing in server environment" }, { status: 500 });
  }

  try {
    const searchParams = new URLSearchParams({
      url,
      key: INDEXNOW_KEY,
    });

    const res = await fetch(`${INDEXNOW_ENDPOINT}?${searchParams.toString()}`);
    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to ping IndexNow", details: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, details: text });
  } catch (err) {
    return NextResponse.json({ error: "Unexpected error", message: String(err) }, { status: 500 });
  }
}
