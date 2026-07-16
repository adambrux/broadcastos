import {
  cloudSaveStatus,
  ensureListenerLogSchema,
  getCloudSaveSql,
  type ListenerLogRow,
} from "@/lib/cloud-save-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type TotalsRow = {
  display_name: string
  total_messages: number
  show_count: number
  last_heard: string
}

type ShowRow = {
  show_id: string
  show_date: string
  messages: number
  names: number
}

function nameKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, " ").trim()
}

function entryFromRow(row: ListenerLogRow) {
  return {
    id: row.id,
    name: row.display_name,
    showId: row.show_id,
    showDate: row.show_date,
    messageCount: row.message_count,
    sourceCounts: row.source_counts ?? {},
    updatedAt: row.updated_at,
  }
}

const knownSources = ["whatsapp", "instagram", "text"] as const

function normaliseSource(value: unknown) {
  const source = typeof value === "string" ? value.toLowerCase().trim() : ""
  return (knownSources as readonly string[]).includes(source) ? source : "whatsapp"
}

export async function GET(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ entries: [], totals: [], shows: [], allTime: { messages: 0, listeners: 0 }, status: cloudSaveStatus() })
  }

  await ensureListenerLogSchema(sql)

  const url = new URL(request.url)
  const showId = url.searchParams.get("showId")
  const showDate = url.searchParams.get("showDate")

  const entries = showId && showDate
    ? (await sql`
        SELECT id, name_key, display_name, show_id, show_date, message_count, source_counts, created_at, updated_at
        FROM broadcastos_listener_log
        WHERE show_id = ${showId} AND show_date = ${showDate}
        ORDER BY message_count DESC, display_name ASC
      ` as ListenerLogRow[]).map(entryFromRow)
    : []

  const totals = await sql`
    SELECT
      MIN(display_name) AS display_name,
      SUM(message_count)::int AS total_messages,
      COUNT(DISTINCT show_date || show_id)::int AS show_count,
      MAX(show_date) AS last_heard
    FROM broadcastos_listener_log
    GROUP BY name_key
    ORDER BY total_messages DESC, last_heard DESC
    LIMIT 60
  ` as TotalsRow[]

  const shows = await sql`
    SELECT
      show_id,
      show_date,
      SUM(message_count)::int AS messages,
      COUNT(*)::int AS names
    FROM broadcastos_listener_log
    GROUP BY show_id, show_date
    ORDER BY show_date DESC
    LIMIT 40
  ` as ShowRow[]

  const sourceRows = await sql`
    SELECT key AS source, SUM(value::int)::int AS total
    FROM broadcastos_listener_log, jsonb_each_text(source_counts)
    GROUP BY key
    ORDER BY total DESC
  ` as { source: string; total: number }[]

  const allTime = {
    messages: totals.reduce((sum, row) => sum + row.total_messages, 0),
    listeners: totals.length,
  }

  return Response.json({
    entries,
    sources: Object.fromEntries(sourceRows.map((row) => [row.source, row.total])),
    totals: totals.map((row) => ({
      name: row.display_name,
      totalMessages: row.total_messages,
      showCount: row.show_count,
      lastHeard: row.last_heard,
    })),
    shows: shows.map((row) => ({
      showId: row.show_id,
      showDate: row.show_date,
      messages: row.messages,
      names: row.names,
    })),
    allTime,
    status: cloudSaveStatus(),
  })
}

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ error: "Online storage is not available yet.", status: cloudSaveStatus() }, { status: 503 })
  }

  await ensureListenerLogSchema(sql)

  const body = await request.json().catch(() => null) as { name?: string; showId?: string; showDate?: string; source?: string } | null
  const name = typeof body?.name === "string" ? body.name.replace(/\s+/g, " ").trim() : ""
  const showId = typeof body?.showId === "string" && body.showId ? body.showId : "afternoons"
  const showDate = typeof body?.showDate === "string" && body.showDate ? body.showDate : new Date().toISOString().slice(0, 10)
  const source = normaliseSource(body?.source)

  if (!name) {
    return Response.json({ error: "A listener name is needed." }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO broadcastos_listener_log (id, name_key, display_name, show_id, show_date, message_count, source_counts)
    VALUES (${crypto.randomUUID()}, ${nameKey(name)}, ${name}, ${showId}, ${showDate}, 1, jsonb_build_object(${source}::text, 1))
    ON CONFLICT (name_key, show_id, show_date)
    DO UPDATE SET
      message_count = broadcastos_listener_log.message_count + 1,
      source_counts = jsonb_set(
        broadcastos_listener_log.source_counts,
        ARRAY[${source}::text],
        to_jsonb(COALESCE((broadcastos_listener_log.source_counts->>${source})::int, 0) + 1)
      ),
      display_name = ${name},
      updated_at = NOW()
    RETURNING id, name_key, display_name, show_id, show_date, message_count, source_counts, created_at, updated_at
  ` as ListenerLogRow[]

  const saved = rows.at(0)
  return Response.json({ entry: saved ? entryFromRow(saved) : null, status: cloudSaveStatus() })
}

export async function DELETE(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ error: "Online storage is not available yet.", status: cloudSaveStatus() }, { status: 503 })
  }

  await ensureListenerLogSchema(sql)

  const url = new URL(request.url)
  const showId = url.searchParams.get("showId") ?? ""
  const showDate = url.searchParams.get("showDate") ?? ""
  const name = url.searchParams.get("name") ?? ""

  if (!showId || !showDate || !name) {
    return Response.json({ error: "showId, showDate and name are needed." }, { status: 400 })
  }

  await sql`
    DELETE FROM broadcastos_listener_log
    WHERE name_key = ${nameKey(name)} AND show_id = ${showId} AND show_date = ${showDate}
  `

  return Response.json({ ok: true, status: cloudSaveStatus() })
}
