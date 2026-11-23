import { ensureListenerMessagesSchema, getCloudSaveSql, type CheckinRow, type ListenerMessageRow } from "@/lib/cloud-save-db"
import { isMessageSource, isPronoun, type ListenerMessage } from "@/lib/listener-messages-shared"
import { listenerNameKeyServer } from "@/lib/listener-log-store"

type BroadcastSql = NonNullable<ReturnType<typeof getCloudSaveSql>>

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string") return value
  return new Date(String(value)).toISOString()
}

export function messageFromRow(row: ListenerMessageRow): ListenerMessage {
  return {
    id: row.id,
    nameKey: row.name_key,
    name: row.display_name,
    source: isMessageSource(row.source) ? row.source : "whatsapp",
    raw: row.raw,
    readVersion: row.read_version,
    readStatus: row.read_status === "ready" ? "ready" : "pending",
    showId: row.show_id,
    showDate: row.show_date,
    pronoun: isPronoun(row.pronoun) ? row.pronoun : "",
    createdAt: toIso(row.created_at),
    usedAt: row.used_at ? toIso(row.used_at) : null,
  }
}

const COLUMNS = "id, name_key, display_name, source, raw, read_version, read_status, show_id, show_date, pronoun, created_at, used_at"

export async function listMessages(sql: BroadcastSql, userId: string, options: { name?: string; pending?: boolean; limit?: number } = {}) {
  await ensureListenerMessagesSchema(sql)
  const limit = Math.min(Math.max(options.limit ?? 60, 1), 300)
  let rows: ListenerMessageRow[]
  if (options.name) {
    const key = listenerNameKeyServer(options.name)
    rows = await sql`
      SELECT id, name_key, display_name, source, raw, read_version, read_status, show_id, show_date, pronoun, created_at, used_at
      FROM broadcastos_listener_messages
      WHERE user_id = ${userId} AND name_key = ${key}
      ORDER BY created_at DESC
      LIMIT ${limit}::int
    ` as ListenerMessageRow[]
  } else if (options.pending) {
    rows = await sql`
      SELECT id, name_key, display_name, source, raw, read_version, read_status, show_id, show_date, pronoun, created_at, used_at
      FROM broadcastos_listener_messages
      WHERE user_id = ${userId} AND read_status = 'pending'
      ORDER BY created_at DESC
      LIMIT ${limit}::int
    ` as ListenerMessageRow[]
  } else {
    rows = await sql`
      SELECT id, name_key, display_name, source, raw, read_version, read_status, show_id, show_date, pronoun, created_at, used_at
      FROM broadcastos_listener_messages
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}::int
    ` as ListenerMessageRow[]
  }
  return rows.map(messageFromRow)
}

export async function findMessage(sql: BroadcastSql, userId: string, id: string) {
  await ensureListenerMessagesSchema(sql)
  const rows = await sql`
    SELECT id, name_key, display_name, source, raw, read_version, read_status, show_id, show_date, pronoun, created_at, used_at
    FROM broadcastos_listener_messages
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  ` as ListenerMessageRow[]
  const row = rows.at(0)
  return row ? messageFromRow(row) : null
}

export async function insertMessage(
  sql: BroadcastSql,
  userId: string,
  input: { name: string; source: string; raw: string; readVersion: string | null; showId: string; showDate: string; pronoun?: string }
) {
  await ensureListenerMessagesSchema(sql)
  const name = input.name.replace(/\s+/g, " ").trim()
  const status = input.readVersion ? "ready" : "pending"
  const pronoun = isPronoun(input.pronoun) ? input.pronoun : ""
  const rows = await sql`
    INSERT INTO broadcastos_listener_messages (id, user_id, name_key, display_name, source, raw, read_version, read_status, show_id, show_date, pronoun)
    VALUES (${crypto.randomUUID()}, ${userId}, ${listenerNameKeyServer(name)}, ${name}, ${input.source}, ${input.raw}, ${input.readVersion}, ${status}, ${input.showId}, ${input.showDate}, ${pronoun})
    RETURNING id, name_key, display_name, source, raw, read_version, read_status, show_id, show_date, pronoun, created_at, used_at
  ` as ListenerMessageRow[]
  const row = rows.at(0)
  return row ? messageFromRow(row) : null
}

export async function updateMessage(
  sql: BroadcastSql,
  userId: string,
  id: string,
  patch: { readVersion?: string; used?: boolean; pronoun?: string }
) {
  await ensureListenerMessagesSchema(sql)
  const readVersion = typeof patch.readVersion === "string" ? patch.readVersion.trim() : null
  const pronoun = isPronoun(patch.pronoun) ? patch.pronoun : null
  const usedAt = patch.used === true ? new Date().toISOString() : null
  const clearUsed = patch.used === false
  // Every parameter is cast: Postgres cannot infer a type for a bare null in IS NOT NULL or COALESCE.
  const rows = await sql`
    UPDATE broadcastos_listener_messages
    SET
      read_version = COALESCE(${readVersion}::text, read_version),
      read_status = CASE WHEN ${readVersion}::text IS NOT NULL AND ${readVersion}::text <> '' THEN 'ready' ELSE read_status END,
      used_at = CASE WHEN ${clearUsed}::boolean THEN NULL ELSE COALESCE(${usedAt}::timestamptz, used_at) END,
      pronoun = COALESCE(${pronoun}::text, pronoun)
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id, name_key, display_name, source, raw, read_version, read_status, show_id, show_date, pronoun, created_at, used_at
  ` as ListenerMessageRow[]
  const row = rows.at(0)
  return row ? messageFromRow(row) : null
}

/**
 * Deletes a message. When it was the only message from that person on that
 * show day, the name-log row it created goes too, so a paste by mistake (or a
 * test) leaves no trace in the regulars list or the missing list.
 */
export async function deleteMessage(sql: BroadcastSql, userId: string, id: string) {
  await ensureListenerMessagesSchema(sql)
  const rows = await sql`
    DELETE FROM broadcastos_listener_messages WHERE id = ${id} AND user_id = ${userId}
    RETURNING name_key, show_id, show_date
  ` as { name_key: string; show_id: string; show_date: string }[]
  const gone = rows.at(0)
  if (!gone) return
  const remaining = await sql`
    SELECT COUNT(*)::int AS count FROM broadcastos_listener_messages
    WHERE user_id = ${userId} AND name_key = ${gone.name_key} AND show_id = ${gone.show_id} AND show_date = ${gone.show_date}
  ` as { count: number }[]
  if ((remaining.at(0)?.count ?? 0) === 0) {
    await sql`
      DELETE FROM broadcastos_listener_log
      WHERE user_id = ${userId} AND name_key = ${gone.name_key} AND show_id = ${gone.show_id} AND show_date = ${gone.show_date} AND message_count <= 1
    `
  }
}

/** Variant ids of every check-in already sent to this person. */
export async function sentCheckinVariants(sql: BroadcastSql, userId: string, name: string) {
  await ensureListenerMessagesSchema(sql)
  const rows = await sql`
    SELECT id, name_key, variant, text, show_label, sent_at
    FROM broadcastos_checkins
    WHERE user_id = ${userId} AND name_key = ${listenerNameKeyServer(name)}
    ORDER BY sent_at DESC
  ` as CheckinRow[]
  return rows.map((row) => row.variant)
}

export async function recordCheckin(sql: BroadcastSql, userId: string, input: { name: string; variant: string; text: string; showLabel: string }) {
  await ensureListenerMessagesSchema(sql)
  await sql`
    INSERT INTO broadcastos_checkins (id, user_id, name_key, variant, text, show_label)
    VALUES (${crypto.randomUUID()}, ${userId}, ${listenerNameKeyServer(input.name)}, ${input.variant}, ${input.text}, ${input.showLabel})
  `
}

/** Messages per show for one person, for the check-in's sign-off. */
export async function showCountsFor(sql: BroadcastSql, userId: string, name: string) {
  const rows = await sql`
    SELECT show_id, SUM(message_count)::int AS messages
    FROM broadcastos_listener_log
    WHERE user_id = ${userId} AND name_key = ${listenerNameKeyServer(name)}
    GROUP BY show_id
  ` as { show_id: string; messages: number }[]
  return rows.map((row) => ({ showId: row.show_id, messages: row.messages }))
}
