import { timingSafeEqual } from "node:crypto"
import { cloudSaveStatus, ensurePresenterHubSchema, getCloudSaveSql } from "@/lib/cloud-save-db"
import { findOwnerUser, findUserByEmail } from "@/lib/auth-db"
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

function tokenCheck(request: Request): "ok" | "unconfigured" | "missing" | "wrong" {
  const expected = (process.env.BROADCASTOS_INBOX_TOKEN ?? "").trim()
  if (!expected) return "unconfigured"
  const header = request.headers.get("authorization") ?? ""
  const given = header.replace(/^Bearer\s+/i, "").trim()
  if (!given) return "missing"
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return "wrong"
  return timingSafeEqual(a, b) ? "ok" : "wrong"
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return typeof error === "string" ? error : "unknown error"
}

/** A quiet health check for the sender: is the inbox switched on at all? */
export async function GET() {
  return Response.json({
    inbox: Boolean((process.env.BROADCASTOS_INBOX_TOKEN ?? "").trim()),
    status: cloudSaveStatus(),
  })
}

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ error: "Database is not configured", status: cloudSaveStatus() }, { status: 503 })
  }

  const check = tokenCheck(request)
  if (check === "unconfigured") {
    return Response.json({ error: "The inbox is not switched on: BROADCASTOS_INBOX_TOKEN is not set on the server." }, { status: 503 })
  }
  if (check !== "ok") {
    return Response.json({ error: "The inbox token is missing or wrong." }, { status: 401 })
  }

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

  const email = (process.env.BROADCASTOS_INBOX_USER_EMAIL ?? "").trim()
  let owner
  try {
    owner = email ? (await findUserByEmail(sql, email))?.user ?? null : await findOwnerUser(sql)
  } catch (error) {
    return Response.json({ error: `Could not reach the database: ${errorMessage(error)}` }, { status: 500 })
  }
  if (!owner || owner.disabled) {
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
