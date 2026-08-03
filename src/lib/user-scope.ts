// Client-side record of who is signed in, so on-device storage can keep each
// presenter's world separate on a shared studio machine. The owner keeps the
// original storage keys so nothing saved before accounts existed is lost.

export type ActiveUser = {
  id: string
  name: string
  role: "owner" | "presenter"
}

const ACTIVE_USER_KEY = "broadcastos-active-user"

export function getActiveUser(): ActiveUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(ACTIVE_USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ActiveUser
    return parsed && typeof parsed.id === "string" && parsed.id ? parsed : null
  } catch {
    return null
  }
}

export function setActiveUser(user: ActiveUser) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user))
  } catch {
    // Storage full or blocked: the app still works, server data stays scoped.
  }
}

export function clearActiveUser() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(ACTIVE_USER_KEY)
  } catch {
    // Ignore.
  }
}

/**
 * The storage key for the signed-in presenter. The owner (and the signed-out
 * state) use the original keys, so the app's pre-accounts history stays put;
 * every other account gets its own shelf.
 */
export function scopedKey(base: string) {
  const user = getActiveUser()
  if (!user || user.role === "owner") return base
  return `${base}::${user.id.slice(0, 8)}`
}
