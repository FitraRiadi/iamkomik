const KEY = "iamkomik-reader-id"

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `reader-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getReaderId(): string {
  try {
    const existing = localStorage.getItem(KEY)
    if (existing && existing.length >= 8) return existing
    const fresh = createId()
    localStorage.setItem(KEY, fresh)
    return fresh
  } catch {
    return createId()
  }
}
