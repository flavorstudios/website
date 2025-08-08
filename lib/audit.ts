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