import { getCloudSaveSql } from "@/lib/cloud-save-db"
import { inboxRefusal, resolveInboxUser } from "@/lib/inbox-auth"
import { bumpListenerLog } from "@/lib/listener-log-store"
import { isMessageSource, isPronoun } from "@/lib/listener-messages-shared"
import { deleteMessage, ensureProfile, findMessage, insertMessage, listMessages, updateMessage } from "@/lib/listener-messages-store"
import { readVersionConfigured, writeReadVersion } from "@/lib/read-version"
import { showDisplayNameFor } from "@/lib/show-session-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * The producer's side of the message bank (v2.41, v2.42). GET: messages still
 * waiting for a read version (?pending=1, the default), the recent bank
 * (?recent=1) or one person (?name=). POST {id, readVersion}: fills a read
 * version in. POST {name, raw, source?, showId?, showDate?}: banks a message
 * from the producer's side and writes its read, the way the app does.
 * DELETE ?id=: removes one (a test message, a paste by mistake).
 */
export const maxDuration = 60
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

  const body = (await request.json().catch(() => null)) as { id?: unknown; readVersion?: unknown; rewrite?: unknown; name?: unknown; raw?: unknown; source?: unknown; showId?: unknown; showDate?: unknown; pronoun?: unknown } | null
  const id = typeof body?.id === "string" ? body.id.trim() : ""
  const readVersion = typeof body?.readVersion === "string" ? body.readVersion.trim() : ""

  if (id && body?.rewrite === true) {
    if (!readVersionConfigured()) return Response.json({ error: "The AI key is not set on the server." }, { status: 503 })
    const existing = await findMessage(sql, owner.id, id)
    if (!existing) return Response.json({ error: "No message with that id." }, { status: 404 })
    const pronoun = isPronoun(body?.pronoun) ? body.pronoun : existing.pronoun
    const rewritten = await writeReadVersion({ name: existing.name, raw: existing.raw, showName: showDisplayNameFor(existing.showId), source: existing.source, pronoun })
    if (!rewritten) return Response.json({ error: "The read did not come back." }, { status: 502 })
    const message = await updateMessage(sql, owner.id, id, { readVersion: rewritten, pronoun })
    return Response.json({ message })
  }

  if (id) {
    if (!readVersion) return Response.json({ error: "Send the message id and the read version." }, { status: 400 })
    const message = await updateMessage(sql, owner.id, id, { readVersion })
    if (!message) return Response.json({ error: "No message with that id." }, { status: 404 })
    return Response.json({ message })
  }

  // A new message from the producer's side: bank it and write the read, exactly as the app does.
  const name = typeof body?.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, 120) : ""
  const raw = typeof body?.raw === "string" ? body.raw.trim().slice(0, 6000) : ""
  if (!name || !raw) return Response.json({ error: "Send the name and the message (or an id with a read version)." }, { status: 400 })
  const source = isMessageSource(body?.source) ? body.source : "whatsapp"
  const pronoun = isPronoun(body?.pronoun) ? body.pronoun : ""
  const showId = typeof body?.showId === "string" && body.showId ? body.showId.slice(0, 40) : "afternoons"
  const showDate = typeof body?.showDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.showDate) ? body.showDate : new Date().toISOString().slice(0, 10)

  let written: string | null = null
  let readError: string | null = null
  if (readVersionConfigured()) {
    try {
      written = await writeReadVersion({ name, raw, showName: showDisplayNameFor(showId), source, pronoun })
    } catch (error) {
      readError = error instanceof Error ? error.message : "unknown error"
      console.error("inbox messages: read version failed", error)
    }
  }
  const message = await insertMessage(sql, owner.id, { name, source, raw, readVersion: written, showId, showDate, pronoun })
  if (!message) return Response.json({ error: "The message did not save." }, { status: 500 })
  await bumpListenerLog(sql, owner.id, { name, showId, showDate, source }).catch((error) => console.error("inbox messages: name log bump failed", error))
  await ensureProfile(sql, owner.id, name).catch((error) => console.error("inbox messages: profile failed", error))
  return Response.json({ message, ai: readVersionConfigured(), readError })
}

export async function DELETE(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Database is not configured" }, { status: 503 })

  const refusal = inboxRefusal(request)
  if (refusal) return refusal

  const owner = await resolveInboxUser(sql).catch(() => null)
  if (!owner) return Response.json({ error: "There is no account for the inbox to write to yet." }, { status: 503 })

  const id = new URL(request.url).searchParams.get("id")?.trim() ?? ""
  if (!id) return Response.json({ error: "Which message?" }, { status: 400 })
  await deleteMessage(sql, owner.id, id)
  return Response.json({ ok: true })
}
