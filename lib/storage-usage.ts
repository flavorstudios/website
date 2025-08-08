export interface UsageResult {
  usage: number
  quota: number
  overQuota: boolean
}

const usageMap = new Map<string, number>()

function getQuota() {
  return parseInt(process.env.USER_STORAGE_QUOTA || "104857600")
}

export function addStorageUsage(uid: string, size: number): UsageResult {
  const current = usageMap.get(uid) || 0
  const usage = current + size
  usageMap.set(uid, usage)
  const quota = getQuota()
  return { usage, quota, overQuota: usage > quota }
}

export function reduceStorageUsage(uid: string, size: number): UsageResult {
  const current = usageMap.get(uid) || 0
  const usage = Math.max(0, current - size)
  usageMap.set(uid, usage)
  const quota = getQuota()
  return { usage, quota, overQuota: usage > quota }
}

export function getStorageUsage(uid: string): UsageResult {
  const usage = usageMap.get(uid) || 0
  const quota = getQuota()
  return { usage, quota, overQuota: usage > quota }
}