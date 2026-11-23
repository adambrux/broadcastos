import { ensureParkedNotesSchema, getCloudSaveSql, type ParkedNoteRow } from "@/lib/cloud-save-db"
import { isParkedSource, isParkedWhen, type ParkedNote } from "@/lib/parked-notes-shared"

type BroadcastSql = NonNullable<ReturnType<typeof getCloudSaveSql>>

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string") return value
  return new Date(String(value)).toISOString()
}

export function noteFromRow(row: ParkedNoteRow): ParkedNote {
  return {
    id: row.id,
    text: row.text,
    source: isParkedSource(row.source) ? row.source : "whatsapp",
    sender: row.sender ?? "",
    when: isParkedWhen(row.when_for) ? row.when_for : "later-today",
    showId: row.show_id ?? "",
    showDate: row.show_date ?? "",
    createdAt: toIso(row.created_at),
    usedAt: row.used_at ? toIso(row.used_at) : null,
  }
}

/** Reads a note out of a request body: trimmed text is required, everything else has a safe default. */
export function normaliseNoteInput(value: unknown): ParkedNote | null {
  if (!value || typeof value !== "object") return null
  const v = value as Record<string, unknown>
  const text = typeof v.text === "string" ? v.text.trim() : ""
  if (!text) return null
  const id = typeof v.id === "string" && v.id.trim() ? v.id.trim().slice(0, 80) : crypto.randomUUID()
  const createdAt = typeof v.createdAt === "string" && !Number.isNaN(Date.parse(v.createdAt)) ? new Date(v.createdAt).toISOString() : new Date().toISOString()
  const usedAt = typeof v.usedAt === "string" && !Number.isNaN(Date.parse(v.usedAt)) ? new Date(v.usedAt).toISOString() : null
  return {
    id,
    text: text.slice(0, 4000),
    source: isParkedSource(v.source) ? v.source : "whatsapp",
    sender: typeof v.sender === "string" ? v.sender.trim().slice(0, 120) : "",
    when: isParkedWhen(v.when) ? v.when : "later-today",
    showId: typeof v.showId === "string" ? v.showId.slice(0, 40) : "",
    showDate: typeof v.showDate === "string" ? v.showDate.slice(0, 10) : "",
    createdAt,
    usedAt,
  }
}

/** Open notes plus the ones used in the last few days (so a "Put back" is possible). */
export async function listParkedNotes(sql: BroadcastSql, userId: string, usedWithinDays = 7) {
  await ensureParkedNotesSchema(sql)
  const since = new Date(Date.now() - usedWithinDays * 24 * 60 * 60 * 1000).toISOString()
  const rows = await sql`
    SELECT id, text, source, sender, when_for, show_id, show_date, created_at, used_at
    FROM broadcastos_parked_notes
    WHERE user_id = ${userId} AND (used_at IS NULL OR used_at >= ${since})
    ORDER BY (used_at IS NOT NULL) ASC, created_at DESC
    LIMIT 200
  ` as ParkedNoteRow[]
  return rows.map(noteFromRow)
}

export async function upsertParkedNote(sql: BroadcastSql, userId: string, note: ParkedNote) {
  await ensureParkedNotesSchema(sql)
  const rows = await sql`
    INSERT INTO broadcastos_parked_notes (id, user_id, text, source, sender, when_for, show_id, show_date, created_at, used_at)
    VALUES (${note.id}, ${userId}, ${note.text}, ${note.source}, ${note.sender}, ${note.when}, ${note.showId}, ${note.showDate}, ${note.createdAt}, ${note.usedAt})
    ON CONFLICT (id) DO UPDATE SET
      text = EXCLUDED.text,
      source = EXCLUDED.source,
      sender = EXCLUDED.sender,
      when_for = EXCLUDED.when_for,
      show_id = EXCLUDED.show_id,
      show_date = EXCLUDED.show_date,
      used_at = EXCLUDED.used_at
    WHERE broadcastos_parked_notes.user_id = ${userId}
    RETURNING id, text, source, sender, when_for, show_id, show_date, created_at, used_at
  ` as ParkedNoteRow[]
  const row = rows.at(0)
  return row ? noteFromRow(row) : null
}

export async function deleteParkedNote(sql: BroadcastSql, userId: string, id: string) {
  await ensureParkedNotesSchema(sql)
  await sql`DELETE FROM broadcastos_parked_notes WHERE id = ${id} AND user_id = ${userId}`
}
