import {
  cloudSaveStatus,
  ensureCloudSaveSchema,
  getCloudSaveSql,
  validateCloudSaveRequest,
} from "@/lib/cloud-save-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ id: string }>
}

type SavedShowSessionDetailRow = {
  id: string
  title: string
  show_id: string
  show_date: string
  workspace: unknown
  created_at: string
  updated_at: string
}

export async function GET(request: Request, context: RouteContext) {
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

  const { id } = await context.params
  const rows = await sql`
    SELECT id, title, show_id, show_date, workspace, created_at, updated_at
    FROM broadcastos_show_sessions
    WHERE id = ${id}
    LIMIT 1
  ` as SavedShowSessionDetailRow[]

  const [session] = rows
  if (!session) return Response.json({ error: "Show session not found" }, { status: 404 })

  return Response.json({ session, status: cloudSaveStatus() })
}

export async function DELETE(request: Request, context: RouteContext) {
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

  const { id } = await context.params
  await sql`DELETE FROM broadcastos_show_sessions WHERE id = ${id}`

  return Response.json({ ok: true, status: cloudSaveStatus() })
}
