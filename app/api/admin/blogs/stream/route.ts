import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { subscribeUser } from "@/lib/sse-broker";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = "blog"; // broadcast to all admin clients
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let heartbeat: NodeJS.Timeout;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      unsubscribe = subscribeUser(userId, controller);
      controller.enqueue(encoder.encode(`event: ready\ndata: {}\n\n`));
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe?.();
        try {
          controller.close();
        } catch {
          // ignore
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
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}