import {
  cloudSaveStatus,
  ensureListenerLogSchema,
  getCloudSaveSql,
  type ListenerNoteRow,
  type ListenerProfileRow,
} from "@/lib/cloud-save-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function nameKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, " ").trim()
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown storage error"
}

function profileFromRow(row: ListenerProfileRow) {
  return {
    nameKey: row.name_key,
    name: row.display_name,
    birthday: row.birthday ?? "",
    favouriteSong: row.favourite_song ?? "",
  }
}

// Neon returns TIMESTAMPTZ as Date objects; the app works in ISO strings.
function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function noteFromRow(row: ListenerNoteRow) {
  return {
    id: row.id,
    nameKey: row.name_key,
    tag: row.tag,
    content: row.content,
    showDate: row.show_date ?? "",
    createdAt: toIso(row.created_at),
  }
}

export async function GET() {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ profiles: [], notes: [], status: cloudSaveStatus() })
  }

  try {
    await ensureListenerLogSchema(sql)

    const profileRows = await sql`
      SELECT name_key, display_name, birthday, favourite_song, created_at, updated_at
      FROM broadcastos_listener_profiles
      ORDER BY updated_at DESC
      LIMIT 200
    ` as ListenerProfileRow[]

    const noteRows = await sql`
      SELECT id, name_key, tag, content, show_date, created_at
      FROM broadcastos_listener_notes
      ORDER BY created_at DESC
      LIMIT 400
    ` as ListenerNoteRow[]

    return Response.json({
      profiles: profileRows.map(profileFromRow),
      notes: noteRows.map(noteFromRow),
      status: cloudSaveStatus(),
    })
  } catch (error) {
    return Response.json({ profiles: [], notes: [], error: errorMessage(error), status: cloudSaveStatus() })
  }
}

type ProfilePayload = {
  name?: string
  birthday?: string
  favouriteSong?: string
  note?: { tag?: string; content?: string; showDate?: string }
}

const noteTags = ["birthday", "favourite-song", "keeper"] as const

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ error: "Online storage is not available yet.", status: cloudSaveStatus() }, { status: 503 })
  }

  try {
    await ensureListenerLogSchema(sql)

    const body = await request.json().catch(() => null) as ProfilePayload | null
    const name = typeof body?.name === "string" ? body.name.replace(/\s+/g, " ").trim() : ""
    if (!name) {
      return Response.json({ error: "A listener name is needed." }, { status: 400 })
    }
    const key = nameKey(name)

    const noteContent = typeof body?.note?.content === "string" ? body.note.content.trim() : ""
    const noteTag = (noteTags as readonly string[]).includes(body?.note?.tag ?? "") ? body!.note!.tag! : "keeper"

    // A birthday or favourite-song note also fills the matching profile field.
    const birthday = typeof body?.birthday === "string" ? body.birthday.trim()
      : noteContent && noteTag === "birthday" ? noteContent : undefined
    const favouriteSong = typeof body?.favouriteSong === "string" ? body.favouriteSong.trim()
      : noteContent && noteTag === "favourite-song" ? noteContent : undefined

    const profileRows = await sql`
      INSERT INTO broadcastos_listener_profiles (name_key, display_name, birthday, favourite_song)
      VALUES (${key}, ${name}, ${birthday ?? null}, ${favouriteSong ?? null})
      ON CONFLICT (name_key)
      DO UPDATE SET
        display_name = ${name},
        birthday = COALESCE(${birthday ?? null}, broadcastos_listener_profiles.birthday),
        favourite_song = COALESCE(${favouriteSong ?? null}, broadcastos_listener_profiles.favourite_song),
        updated_at = NOW()
      RETURNING name_key, display_name, birthday, favourite_song, created_at, updated_at
    ` as ListenerProfileRow[]

    let note = null
    if (noteContent) {
      const noteRows = await sql`
        INSERT INTO broadcastos_listener_notes (id, name_key, tag, content, show_date)
        VALUES (${crypto.randomUUID()}, ${key}, ${noteTag}, ${noteContent}, ${body?.note?.showDate ?? null})
        RETURNING id, name_key, tag, content, show_date, created_at
      ` as ListenerNoteRow[]
      note = noteRows.at(0) ? noteFromRow(noteRows[0]) : null
    }

    const saved = profileRows.at(0)
    return Response.json({ profile: saved ? profileFromRow(saved) : null, note, status: cloudSaveStatus() })
  } catch (error) {
    return Response.json({ error: errorMessage(error), status: cloudSaveStatus() }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ error: "Online storage is not available yet.", status: cloudSaveStatus() }, { status: 503 })
  }

  try {
    await ensureListenerLogSchema(sql)

    const url = new URL(request.url)
    const noteId = url.searchParams.get("noteId")
    if (!noteId) {
      return Response.json({ error: "noteId is needed." }, { status: 400 })
    }

    await sql`DELETE FROM broadcastos_listener_notes WHERE id = ${noteId}`
    return Response.json({ ok: true, status: cloudSaveStatus() })
  } catch (error) {
    return Response.json({ error: errorMessage(error), status: cloudSaveStatus() }, { status: 500 })
  }
}
