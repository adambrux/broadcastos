import { cloudSaveStatus, ensureListenerLogSchema, getCloudSaveSql } from "@/lib/cloud-save-db"
import { requireUser } from "@/lib/auth-db"
import { buildCheckin, showLabelFor } from "@/lib/checkin-text"
import { listenerNameKeyServer } from "@/lib/listener-log-store"
import { recordCheckin, sentCheckinVariants, showCountsFor } from "@/lib/listener-messages-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * THE CHECK-IN (v2.41). GET ?name= writes a message for someone who has gone
 * quiet, in wording they have never had before. POST records it as sent and
 * rests the missing-list clock (the profile's last check-in).
 */
export async function GET(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not configured yet.", status: cloudSaveStatus() }, { status: 503 })

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response
  const userId = auth.user.id

  const url = new URL(request.url)
  const name = url.searchParams.get("name")?.replace(/\s+/g, " ").trim() ?? ""
  if (!name) return Response.json({ error: "Whose check-in?" }, { status: 400 })

  const [used, counts] = await Promise.all([sentCheckinVariants(sql, userId, name), showCountsFor(sql, userId, name)])
  const show = url.searchParams.get("show")?.trim() || showLabelFor(counts)
  const built = buildCheckin(name, show, used)
  return Response.json({ name, show, text: built.text, variant: built.variant, sentBefore: used.length })
}

type PostBody = { name?: unknown; text?: unknown; variant?: unknown; show?: unknown }

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not configured yet." }, { status: 503 })

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response
  const userId = auth.user.id

  const body = (await request.json().catch(() => null)) as PostBody | null
  const name = typeof body?.name === "string" ? body.name.replace(/\s+/g, " ").trim() : ""
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 1000) : ""
  const variant = typeof body?.variant === "string" ? body.variant.slice(0, 40) : "edited"
  const show = typeof body?.show === "string" ? body.show.slice(0, 60) : ""
  if (!name || !text) return Response.json({ error: "The name and the message are both needed." }, { status: 400 })

  await recordCheckin(sql, userId, { name, variant, text, showLabel: show })

  // The missing list rests for this person: same field the "I've checked in" button sets.
  await ensureListenerLogSchema(sql)
  const now = new Date().toISOString()
  await sql`
    INSERT INTO broadcastos_listener_profiles (name_key, user_id, display_name, last_checkin_at)
    VALUES (${listenerNameKeyServer(name)}, ${userId}, ${name}, ${now})
    ON CONFLICT (user_id, name_key)
    DO UPDATE SET last_checkin_at = ${now}, updated_at = NOW()
  `
  return Response.json({ ok: true, sentAt: now })
}
