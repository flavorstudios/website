export const runtime = "edge"

const rooms = new Map<string, Set<WebSocket>>()

type RouteContext = { params: Promise<{ id: string }> }

interface ServerWebSocket extends WebSocket {
  accept: () => void
}

export async function GET(request: Request, context: RouteContext) {
  const pair = new WebSocketPair()
  const [client, server]: [WebSocket, ServerWebSocket] = Object.values(pair)
  const { id: postId } = await context.params
  let set = rooms.get(postId)
  if (!set) {
    set = new Set()
    rooms.set(postId, set)
  }
  server.accept()
  set.add(server)

  // Keepalive to reduce idle disconnects on some hosts
  const ping = setInterval(() => {
    try {
      server.send("ping")
    } catch {
      // ignore transient send errors
    }
  }, 30_000)

  server.addEventListener("message", (event) => {
    for (const ws of set!) {
      if (ws !== server) ws.send(event.data)
    }
  })

  server.addEventListener("close", () => {
    clearInterval(ping)
    set!.delete(server)
    if (set!.size === 0) {
      rooms.delete(postId)
    }
  })

  return new Response(null, { status: 101, webSocket: client })
}
