import { getCloudSaveSql } from "@/lib/cloud-save-db"
import { inboxRefusal, resolveInboxUser } from "@/lib/inbox-auth"
import { listMessages, updateMessage } from "@/lib/listener-messages-store"
import { readVersionConfigured } from "@/lib/read-version"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * The producer's side of the message bank (v2.41). GET: messages still waiting
 * for a read version (?pending=1, the default) or the recent bank (?recent=1).
 * POST {id, readVersion}: fills a read version in, the way the app would have.
 */
export async function GET(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Database is not configured" }, { status: 503 })

  const refusal = inboxRefusal(request)
  if (refusal) return refusal

  const owner = await resolveInboxUser(sql).catch(() => null)
  if (!owner) return Response.json({ error: "There is no account for the inbox to read from yet." }, { status: 503 })

  const url = new URL(request.url)
  const recent = url.searchParams.get("recent") === "1"
  const name = url.searchParams.get("name")?.trim() || undefined
  const messages = await listMessages(sql, owner.id, name ? { name } : recent ? { limit: 60 } : { pending: true })
  return Response.json({ messages, ai: readVersionConfigured() })
}

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Database is not configured" }, { status: 503 })

  const refusal = inboxRefusal(request)
  if (refusal) return refusal

  const owner = await resolveInboxUser(sql).catch(() => null)
  if (!owner) return Response.json({ error: "There is no account for the inbox to write to yet." }, { status: 503 })

  const body = (await request.json().catch(() => null)) as { id?: unknown; readVersion?: unknown } | null
  const id = typeof body?.id === "string" ? body.id.trim() : ""
  const readVersion = typeof body?.readVersion === "string" ? body.readVersion.trim() : ""
  if (!id || !readVersion) return Response.json({ error: "Send the message id and the read version." }, { status: 400 })

  const message = await updateMessage(sql, owner.id, id, { readVersion })
  if (!message) return Response.json({ error: "No message with that id." }, { status: 404 })
  return Response.json({ message })
}
