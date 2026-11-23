import { cloudSaveStatus, getCloudSaveSql } from "@/lib/cloud-save-db"
import { requireUser } from "@/lib/auth-db"
import { bumpListenerLog } from "@/lib/listener-log-store"
import { isMessageSource, isPronoun } from "@/lib/listener-messages-shared"
import { deleteMessage, findMessage, insertMessage, listMessages, updateMessage } from "@/lib/listener-messages-store"
import { readVersionConfigured, writeReadVersion } from "@/lib/read-version"
import { showDisplayNameFor } from "@/lib/show-session-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/** THE MESSAGE BANK (v2.41): the signed-in presenter's pasted messages and their read versions. */

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "unknown error"
}

export async function GET(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ messages: [], ai: false, status: cloudSaveStatus() })

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response

  const url = new URL(request.url)
  const name = url.searchParams.get("name")?.trim() || undefined
  const pending = url.searchParams.get("pending") === "1"
  const limit = Number(url.searchParams.get("limit") ?? "") || undefined

  try {
    const messages = await listMessages(sql, auth.user.id, { name, pending, limit })
    return Response.json({ messages, ai: readVersionConfigured(), status: cloudSaveStatus() })
  } catch (error) {
    return Response.json({ messages: [], ai: readVersionConfigured(), error: `The message bank could not be read: ${errorMessage(error)}` }, { status: 500 })
  }
}

type PostBody = { name?: unknown; raw?: unknown; source?: unknown; showId?: unknown; showDate?: unknown; pronoun?: unknown }

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not configured yet." }, { status: 503 })

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response
  const userId = auth.user.id

  const body = (await request.json().catch(() => null)) as PostBody | null
  const name = typeof body?.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, 120) : ""
  const raw = typeof body?.raw === "string" ? body.raw.trim().slice(0, 6000) : ""
  const source = isMessageSource(body?.source) ? body.source : "whatsapp"
  const pronoun = isPronoun(body?.pronoun) ? body.pronoun : ""
  const showId = typeof body?.showId === "string" && body.showId ? body.showId.slice(0, 40) : "afternoons"
  const showDate = typeof body?.showDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.showDate) ? body.showDate : new Date().toISOString().slice(0, 10)

  if (!name) return Response.json({ error: "Whose message is it? Add their name." }, { status: 400 })
  if (!raw) return Response.json({ error: "Paste the message first." }, { status: 400 })

  // The read version first, so the row lands complete when the key is set. A failure is not a lost message: it stays pending.
  let readVersion: string | null = null
  let readError = ""
  if (readVersionConfigured()) {
    try {
      readVersion = await writeReadVersion({ name, raw, showName: showDisplayNameFor(showId), source, pronoun })
    } catch (error) {
      console.error("listener-messages: read version failed", error)
      readError = errorMessage(error)
    }
  }

  try {
    const message = await insertMessage(sql, userId, { name, source, raw, readVersion, showId, showDate, pronoun })
    if (!message) return Response.json({ error: "The message did not save." }, { status: 500 })
    // Banking a message is hearing from them: the name log and "last heard" move too.
    await bumpListenerLog(sql, userId, { name, showId, showDate, source }).catch((error) => console.error("listener-messages: name log bump failed", error))
    return Response.json({ message, ai: readVersionConfigured(), readError: readError || null })
  } catch (error) {
    return Response.json({ error: `The message did not save: ${errorMessage(error)}` }, { status: 500 })
  }
}

type PatchBody = { id?: unknown; readVersion?: unknown; used?: unknown; rewrite?: unknown; pronoun?: unknown }

export async function PATCH(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not configured yet." }, { status: 503 })

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response

  const body = (await request.json().catch(() => null)) as PatchBody | null
  const id = typeof body?.id === "string" ? body.id.trim() : ""
  if (!id) return Response.json({ error: "Which message?" }, { status: 400 })

  try {
    // "Write it again": the same message back through the current rules.
    if (body?.rewrite === true) {
      if (!readVersionConfigured()) return Response.json({ error: "The app can't write reads yet: the AI key isn't set." }, { status: 503 })
      const existing = await findMessage(sql, auth.user.id, id)
      if (!existing) return Response.json({ error: "That message is not in your bank." }, { status: 404 })
      const pronoun = isPronoun(body?.pronoun) ? body.pronoun : existing.pronoun
      const rewritten = await writeReadVersion({ name: existing.name, raw: existing.raw, showName: showDisplayNameFor(existing.showId), source: existing.source, pronoun })
      if (!rewritten) return Response.json({ error: "The read did not come back this time. Try again in a moment." }, { status: 502 })
      const message = await updateMessage(sql, auth.user.id, id, { readVersion: rewritten, pronoun })
      return Response.json({ message })
    }
    const message = await updateMessage(sql, auth.user.id, id, {
      readVersion: typeof body?.readVersion === "string" ? body.readVersion.slice(0, 2000) : undefined,
      used: typeof body?.used === "boolean" ? body.used : undefined,
      pronoun: isPronoun(body?.pronoun) ? body.pronoun : undefined,
    })
    if (!message) return Response.json({ error: "That message is not in your bank." }, { status: 404 })
    return Response.json({ message })
  } catch (error) {
    return Response.json({ error: `The message did not update: ${errorMessage(error)}` }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not configured yet." }, { status: 503 })

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response

  const id = new URL(request.url).searchParams.get("id")?.trim() ?? ""
  if (!id) return Response.json({ error: "Which message?" }, { status: 400 })

  try {
    await deleteMessage(sql, auth.user.id, id)
    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: `The message did not delete: ${errorMessage(error)}` }, { status: 500 })
  }
}
