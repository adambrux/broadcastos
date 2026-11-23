import {
  cloudSaveStatus,
  ensureCloudSaveSchema,
  ensurePresenterHubSchema,
  getCloudSaveSql,
  type SavedShowSessionRow,
  type SavedShowWorkspace,
} from "@/lib/cloud-save-db"
import { requireUser } from "@/lib/auth-db"
import { after } from "next/server"
import { archiveShowSessionToPresenterHub, defaultSessionTitle, saveShowSessionRow } from "@/lib/show-session-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// Saving a full show plus its Presenter Hub archive must never trip the default function limit.
export const maxDuration = 60

function normaliseTitle(value: unknown, fallback: string) {
  const title = typeof value === "string" ? value.trim() : ""
  return title || fallback
}

function normaliseWorkspace(value: unknown): SavedShowWorkspace {
  if (!value || typeof value !== "object") return {}
  return value as SavedShowWorkspace
}

export async function GET(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ sessions: [], status: cloudSaveStatus() })

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response
  const userId = auth.user.id

  await ensureCloudSaveSchema(sql)

  const rows = await sql`
    SELECT
      id,
      title,
      show_id,
      show_date,
      created_at,
      updated_at,
      COALESCE(
        jsonb_array_length(
          CASE
            WHEN jsonb_typeof(workspace->'items') = 'array' THEN workspace->'items'
            ELSE '[]'::jsonb
          END
        ),
        0
      )::int AS item_count
    FROM broadcastos_show_sessions
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
    LIMIT 40
  ` as SavedShowSessionRow[]

  return Response.json({ sessions: rows, status: cloudSaveStatus() })
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return typeof error === "string" ? error : "unknown error"
}

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json(
      { error: "Database is not configured", status: cloudSaveStatus() },
      { status: 503 }
    )
  }

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response
  const userId = auth.user.id

  try {
    await ensurePresenterHubSchema(sql)
  } catch (error) {
    console.error("show-sessions: schema check failed", error)
    return Response.json(
      { error: `Cloud save could not reach the database: ${errorMessage(error)}`, status: cloudSaveStatus() },
      { status: 500 }
    )
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return Response.json(
      { error: "The show could not be read for saving (the request was empty or not valid JSON).", status: cloudSaveStatus() },
      { status: 400 }
    )
  }

  const workspace = normaliseWorkspace(body.workspace)
  const id = typeof body.id === "string" && body.id ? body.id : crypto.randomUUID()
  const title = normaliseTitle(body.title, defaultSessionTitle(workspace))

  let saved: Awaited<ReturnType<typeof saveShowSessionRow>>
  try {
    saved = await saveShowSessionRow(sql, userId, { id, title, workspace })
  } catch (error) {
    console.error("show-sessions: save failed", error)
    return Response.json(
      { error: `The show did not save online: ${errorMessage(error)}`, status: cloudSaveStatus() },
      { status: 500 }
    )
  }

  const session = saved.session
  if (!session) {
    return Response.json(
      { error: "The show did not save online: a saved show with this id belongs to another account. Save it under a new name.", status: cloudSaveStatus() },
      { status: 409 }
    )
  }

  // The show is safe from here. The Presenter Hub archive (script copy + liner
  // read counts) runs AFTER the reply is sent, so Save online answers as soon as
  // the row is written and a slow archive can never look like a failed save.
  after(async () => {
    try {
      await archiveShowSessionToPresenterHub(sql, { user: auth.user, id, showId: saved.showId, showDate: saved.showDate, workspace })
    } catch (error) {
      console.error("show-sessions: Presenter Hub archive failed", error)
    }
  })

  return Response.json({ session, status: cloudSaveStatus(), archiveWarning: null, archiveDeferred: true })
}
