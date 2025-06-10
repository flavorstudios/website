import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = "ad8701e1daf061102fbe9c2f34fec2a1ecd91184d2121a288237516e3b445b1c";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const searchParams = new URLSearchParams({
    url,
    key: INDEXNOW_KEY,
  });

  const res = await fetch(`${INDEXNOW_ENDPOINT}?${searchParams.toString()}`);
  const text = await res.text();

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to ping IndexNow", details: text }, { status: 500 });
  }

  return NextResponse.json({ success: true, details: text });
}
