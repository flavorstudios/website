import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest } from "next/server";
import { subscribeUser } from "@/lib/sse-broker";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId =
    request.headers.get("x-admin-user") ||
    request.headers.get("x-user-id") ||
    "admin";

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      unsubscribe = subscribeUser(userId, controller);
      controller.enqueue(encoder.encode("event: ready\ndata: {}\n\n"));
      request.signal.addEventListener("abort", () => {
        unsubscribe?.();
      });
    },
    cancel() {
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}