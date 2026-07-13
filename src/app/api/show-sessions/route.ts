import {
  cloudSaveStatus,
  ensureCloudSaveSchema,
  getCloudSaveSql,
  validateCloudSaveRequest,
  type SavedShowSessionRow,
  type SavedShowWorkspace,
} from "@/lib/cloud-save-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function normaliseTitle(value: unknown, fallback: string) {
  const title = typeof value === "string" ? value.trim() : ""
  return title || fallback
}

function normaliseWorkspace(value: unknown): SavedShowWorkspace {
  if (!value || typeof value !== "object") return {}
  return value as SavedShowWorkspace
}

function showName(showId: unknown) {
  if (showId === "sundays") return "Sundays with Adam"
  if (showId === "saturday") return "Saturday Breakfast"
  return "Afternoons with Adam"
}

function defaultTitle(workspace: SavedShowWorkspace) {
  const date = typeof workspace.date === "string" && workspace.date ? workspace.date : "Undated"
  return `${showName(workspace.showId)} · ${date}`
}

export async function GET(request: Request) {
  const authResponse = validateCloudSaveRequest(request)
  if (authResponse) return authResponse

  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ sessions: [], status: cloudSaveStatus() })

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
    ORDER BY updated_at DESC
    LIMIT 40
  ` as SavedShowSessionRow[]

  return Response.json({ sessions: rows, status: cloudSaveStatus() })
}

export async function POST(request: Request) {
  const authResponse = validateCloudSaveRequest(request)
  if (authResponse) return authResponse

  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json(
      { error: "Database is not configured", status: cloudSaveStatus() },
      { status: 503 }
    )
  }

  await ensureCloudSaveSchema(sql)

  const body = await request.json().catch(() => null)
  const workspace = normaliseWorkspace(body?.workspace)
  const id = typeof body?.id === "string" && body.id ? body.id : crypto.randomUUID()
  const title = normaliseTitle(body?.title, defaultTitle(workspace))
  const showId = typeof workspace.showId === "string" && workspace.showId ? workspace.showId : "afternoons"
  const showDate = typeof workspace.date === "string" && workspace.date ? workspace.date : new Date().toISOString().slice(0, 10)
  const workspaceJson = JSON.stringify({ ...workspace, updatedAt: new Date().toISOString() })

  const rows = await sql`
    INSERT INTO broadcastos_show_sessions (id, title, show_id, show_date, workspace)
    VALUES (${id}, ${title}, ${showId}, ${showDate}, ${workspaceJson}::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      show_id = EXCLUDED.show_id,
      show_date = EXCLUDED.show_date,
      workspace = EXCLUDED.workspace,
      updated_at = NOW()
    RETURNING id, title, show_id, show_date, created_at, updated_at
  `

  return Response.json({ session: rows[0], status: cloudSaveStatus() })
}
