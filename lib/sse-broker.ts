import type { ReadableStreamDefaultController } from "stream/web";

// Map of user id to set of SSE stream controllers
const channels = new Map<string, Set<ReadableStreamDefaultController<Uint8Array>>>();
const encoder = new TextEncoder();

/**
 * Subscribe a controller to receive events for a specific user.
 * Returns an unsubscribe function that removes the controller when called.
 */
export function subscribeUser(
  userId: string,
  controller: ReadableStreamDefaultController<Uint8Array>
): () => void {
  let set = channels.get(userId);
  if (!set) {
    set = new Set();
    channels.set(userId, set);
  }
  set.add(controller);
  return () => {
    const current = channels.get(userId);
    if (!current) return;
    current.delete(controller);
    if (current.size === 0) {
      channels.delete(userId);
    }
  };
}

/**
 * Publish an event with data to all subscribers for a user.
 */
export function publishToUser(
  userId: string,
  event: string,
  data: unknown
): void {
  const set = channels.get(userId);
  if (!set || set.size === 0) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const controller of set) {
    try {
      controller.enqueue(encoder.encode(payload));
    } catch {
      // Ignore failed writes; broken streams are cleaned up elsewhere
    }
  }
}