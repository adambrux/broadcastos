import { cloudSaveStatus, ensureCloudSaveSchema, ensurePresenterHubSchema, getCloudSaveSql } from "@/lib/cloud-save-db"
import { getSessionUser } from "@/lib/auth-db"
import { inboxConfigured, inboxRefusal, resolveInboxUser } from "@/lib/inbox-auth"
import { parseShowPlanImport } from "@/lib/show-plan-import"
import { archiveShowSessionToPresenterHub, saveShowSessionRow, showDisplayNameFor } from "@/lib/show-session-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * THE INBOX (v2.39, 23 November 2026). The producer's machine sends a finished
 * show plan straight here, as the same plain text Adam used to paste into the
 * Import Centre. The plan is parsed with the Import Centre's own parser, saved
 * as a show (Saved Shows, ready for the studio iPad) and archived to the
 * Presenter Hub, exactly as Save online would have done.
 *
 * No login: the sender carries a shared secret in the Authorization header
 * (BROADCASTOS_INBOX_TOKEN). The show lands in the owner's account unless
 * BROADCASTOS_INBOX_USER_EMAIL names another one. One row per show per day
 * (id "inbox-<show>-<date>"), so sending a corrected plan replaces the earlier one.
 */

type InboxBody = {
  plan?: unknown
  title?: unknown
  dryRun?: unknown
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return typeof error === "string" ? error : "unknown error"
}

type LastReceivedRow = { id: string; title: string; show_id: string; show_date: string; updated_at: string | Date }

/**
 * The health check. Anyone gets "is the line switched on"; a signed-in
 * presenter also gets the last plan that arrived this way, for the
 * Producer line badge on the Desk and On Air.
 */
export async function GET(request: Request) {
  let lastReceived: { id: string; title: string; showId: string; showDate: string; receivedAt: string } | null = null
  const sql = getCloudSaveSql()
  if (sql) {
    try {
      const user = await getSessionUser(request)
      if (user) {
        await ensureCloudSaveSchema(sql)
        const rows = await sql`
          SELECT id, title, show_id, show_date, updated_at
          FROM broadcastos_show_sessions
          WHERE user_id = ${user.id} AND id LIKE 'inbox-%'
          ORDER BY updated_at DESC
          LIMIT 1
        ` as LastReceivedRow[]
        const row = rows.at(0)
        if (row) {
          const at = row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at)
          lastReceived = { id: row.id, title: row.title, showId: row.show_id, showDate: row.show_date, receivedAt: at }
        }
      }
    } catch (error) {
      console.error("inbox: last received lookup failed", error)
    }
  }
  return Response.json({ inbox: inboxConfigured(), lastReceived, status: cloudSaveStatus() })
}

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ error: "Database is not configured", status: cloudSaveStatus() }, { status: 503 })
  }

  const refusal = inboxRefusal(request)
  if (refusal) return refusal

  const body = (await request.json().catch(() => null)) as InboxBody | null
  const plan = typeof body?.plan === "string" ? body.plan : ""
  if (!plan.trim()) {
    return Response.json({ error: "Send the plan text in \"plan\"." }, { status: 400 })
  }
  const dryRun = body?.dryRun === true

  const parsed = parseShowPlanImport(plan)
  const showId = parsed.showId ?? "afternoons"
  const date = parsed.date ?? new Date().toISOString().slice(0, 10)
  const hours = new Set(parsed.items.map((item) => item.hour)).size
  const summary = {
    showId,
    show: showDisplayNameFor(showId),
    date,
    items: parsed.items.length,
    hours,
    liners: 0,
    promo: Boolean(parsed.preShowPromo.whatsappStatus || parsed.preShowPromo.videoScript),
    warnings: parsed.warnings,
  }

  if (!parsed.items.length) {
    return Response.json({ error: "No links were found in the plan.", ...summary }, { status: 422 })
  }

  if (dryRun) {
    return Response.json({ dryRun: true, ...summary })
  }

  let owner
  try {
    owner = await resolveInboxUser(sql)
  } catch (error) {
    return Response.json({ error: `Could not reach the database: ${errorMessage(error)}` }, { status: 500 })
  }
  if (!owner) {
    return Response.json({ error: "There is no account for the inbox to save into yet." }, { status: 503 })
  }

  const workspace = {
    mode: "in-studio",
    showId,
    date,
    items: parsed.items,
    messages: [],
    preShowPromo: parsed.preShowPromo,
    updatedAt: new Date().toISOString(),
  }
  const id = `inbox-${showId}-${date}`
  const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : `${summary.show} · ${date}`

  let saved: Awaited<ReturnType<typeof saveShowSessionRow>>
  try {
    await ensurePresenterHubSchema(sql)
    saved = await saveShowSessionRow(sql, owner.id, { id, title, workspace })
  } catch (error) {
    console.error("inbox: save failed", error)
    return Response.json({ error: `The show did not save: ${errorMessage(error)}` }, { status: 500 })
  }
  if (!saved.session) {
    return Response.json({ error: "A saved show with this id belongs to another account." }, { status: 409 })
  }

  // The sender waits for the archive here (no studio iPad is waiting on this reply).
  let archive = "ok"
  try {
    const result = await archiveShowSessionToPresenterHub(sql, { user: owner, id, showId: saved.showId, showDate: saved.showDate, workspace })
    summary.liners = result.liners
  } catch (error) {
    console.error("inbox: Presenter Hub archive failed", error)
    archive = `failed: ${errorMessage(error)}`
  }

  return Response.json({ saved: saved.session, ...summary, archive, status: cloudSaveStatus() })
}
