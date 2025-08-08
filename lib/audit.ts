interface AuditEvent {
  uid: string
  action: string
  target?: string
  timestamp: number
}

const memoryLog: AuditEvent[] = []

export function logAuditEvent(uid: string, action: string, target?: string) {
  const event: AuditEvent = { uid, action, target, timestamp: Date.now() }
  memoryLog.push(event)
}

export function getAuditLog() {
  return memoryLog
}

interface RouteAuditOptions {
  uid?: string
  action: string
  target?: string
  req?: Request
}

/**
 * Safe wrapper for route-level auditing.
 * - Does not throw if called with undefined options.
 * - Defaults uid to "anonymous" if not provided.
 */
export async function logRouteAudit(opts?: RouteAuditOptions) {
  try {
    const o = opts ?? ({} as RouteAuditOptions)
    const uid = o.uid ?? 'anonymous'
    const action = o.action ?? 'unknown'
    const target = o.target
    // We intentionally reuse your original logger without changing its signature
    logAuditEvent(uid, action, target)
  } catch {
    // Auditing must never break routes or tests
  }
}
