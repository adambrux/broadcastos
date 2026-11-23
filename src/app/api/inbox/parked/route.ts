import { getCloudSaveSql } from "@/lib/cloud-save-db"
import { inboxRefusal, resolveInboxUser } from "@/lib/inbox-auth"
import { listParkedNotes } from "@/lib/parked-notes-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * The producer's read of the Pocket (v2.40): what Adam parked on air, so a
 * message saved for "another day" can be written into the next plan. Open
 * notes by default; ?all=1 adds the ones used in the last week.
 */
export async function GET(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Database is not configured" }, { status: 503 })

  const refusal = inboxRefusal(request)
  if (refusal) return refusal

  const owner = await resolveInboxUser(sql).catch(() => null)
  if (!owner) return Response.json({ error: "There is no account for the inbox to read from yet." }, { status: 503 })

  const all = new URL(request.url).searchParams.get("all") === "1"
  const notes = await listParkedNotes(sql, owner.id, all ? 7 : 0)
  const open = notes.filter((note) => !note.usedAt)
  return Response.json({ notes: all ? notes : open, open: open.length })
}
