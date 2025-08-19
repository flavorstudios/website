// app/api/admin/notifications/stream/route.ts
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
  let heartbeat: NodeJS.Timeout;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // subscribe and send initial event
      unsubscribe = subscribeUser(userId, controller);
      controller.enqueue(encoder.encode(`event: ready\ndata: {}\n\n`));

      // keep-alive heartbeat (helps proxies/browsers keep the stream open)
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15000);

      // cleanup on client abort
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe?.();
        try {
          controller.close();
        } catch {
          // ignore if already closed
        }
      });
    },
    cancel() {
      clearInterval(heartbeat);
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // nginx: disable buffering
    },
  });
}
