export const runtime = "edge"

const rooms = new Map<string, Set<WebSocket>>()

export function GET(request: Request, { params }: { params: { id: string } }) {
  const { 0: client, 1: server } = Object.values(new WebSocketPair()) as [WebSocket, WebSocket]
  const postId = params.id
  let set = rooms.get(postId)
  if (!set) {
    set = new Set()
    rooms.set(postId, set)
  }
  server.accept()
  set.add(server)
  server.addEventListener("message", (event) => {
    for (const ws of set!) {
      if (ws !== server) ws.send(event.data)
    }
  })
  server.addEventListener("close", () => {
    set!.delete(server)
  })
  return new Response(null, { status: 101, webSocket: client })
}