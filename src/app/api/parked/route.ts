import { cloudSaveStatus, getCloudSaveSql } from "@/lib/cloud-save-db"
import { requireUser } from "@/lib/auth-db"
import { deleteParkedNote, listParkedNotes, normaliseNoteInput, upsertParkedNote } from "@/lib/parked-notes-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** THE POCKET (v2.40): the signed-in presenter's parked notes. */

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "unknown error"
}

export async function GET(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ notes: [], status: cloudSaveStatus() })

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response

  try {
    const notes = await listParkedNotes(sql, auth.user.id)
    return Response.json({ notes, status: cloudSaveStatus() })
  } catch (error) {
    return Response.json({ notes: [], error: `The pocket could not be read: ${errorMessage(error)}`, status: cloudSaveStatus() }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not configured yet." }, { status: 503 })

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response

  const body = (await request.json().catch(() => null)) as { note?: unknown } | null
  const note = normaliseNoteInput(body?.note)
  if (!note) return Response.json({ error: "Write or paste something to park first." }, { status: 400 })

  try {
    const saved = await upsertParkedNote(sql, auth.user.id, note)
    if (!saved) return Response.json({ error: "That note belongs to another account." }, { status: 409 })
    return Response.json({ note: saved })
  } catch (error) {
    return Response.json({ error: `The note did not save: ${errorMessage(error)}` }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not configured yet." }, { status: 503 })

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response

  const id = new URL(request.url).searchParams.get("id")?.trim() ?? ""
  if (!id) return Response.json({ error: "Which note?" }, { status: 400 })

  try {
    await deleteParkedNote(sql, auth.user.id, id)
    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: `The note did not delete: ${errorMessage(error)}` }, { status: 500 })
  }
}
