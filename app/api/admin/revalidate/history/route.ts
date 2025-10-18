import { NextResponse } from "next/server";

import { getHistory } from "@/lib/revalidate-store";

export async function GET() {
  const history = getHistory();
  return NextResponse.json(history);
}