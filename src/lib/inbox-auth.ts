import { timingSafeEqual } from "node:crypto"
import { findOwnerUser, findUserByEmail, type AppUser } from "@/lib/auth-db"
import { getCloudSaveSql } from "@/lib/cloud-save-db"

type BroadcastSql = NonNullable<ReturnType<typeof getCloudSaveSql>>

/**
 * The producer's line into BroadcastOS: one shared secret in the Authorization
 * header (BROADCASTOS_INBOX_TOKEN). Everything sent this way lands in the
 * owner's account unless BROADCASTOS_INBOX_USER_EMAIL names another.
 */

export function inboxConfigured() {
  return Boolean((process.env.BROADCASTOS_INBOX_TOKEN ?? "").trim())
}

export function inboxTokenCheck(request: Request): "ok" | "unconfigured" | "missing" | "wrong" {
  const expected = (process.env.BROADCASTOS_INBOX_TOKEN ?? "").trim()
  if (!expected) return "unconfigured"
  const header = request.headers.get("authorization") ?? ""
  const given = header.replace(/^Bearer\s+/i, "").trim()
  if (!given) return "missing"
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return "wrong"
  return timingSafeEqual(a, b) ? "ok" : "wrong"
}

/** A 503 or 401 Response when the token is not right, or null when it is. */
export function inboxRefusal(request: Request): Response | null {
  const check = inboxTokenCheck(request)
  if (check === "unconfigured") {
    return Response.json({ error: "The inbox is not switched on: BROADCASTOS_INBOX_TOKEN is not set on the server." }, { status: 503 })
  }
  if (check !== "ok") {
    return Response.json({ error: "The inbox token is missing or wrong." }, { status: 401 })
  }
  return null
}

export async function resolveInboxUser(sql: BroadcastSql): Promise<AppUser | null> {
  const email = (process.env.BROADCASTOS_INBOX_USER_EMAIL ?? "").trim()
  const user = email ? (await findUserByEmail(sql, email))?.user ?? null : await findOwnerUser(sql)
  return user && !user.disabled ? user : null
}
