import {
  cloudSaveStatus,
  ensureScriptIssuesSchema,
  getCloudSaveSql,
  type ScriptIssueRow,
} from "@/lib/cloud-save-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Neon returns TIMESTAMPTZ columns as Date objects: coerce before they reach the client.
function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  return value ? String(value) : ""
}

function issueFromRow(row: ScriptIssueRow) {
  return {
    id: row.id,
    showId: row.show_id,
    showDate: row.show_date,
    linkTitle: row.link_title,
    hour: row.hour,
    linkPosition: row.link_position,
    flaggedText: row.flagged_text,
    saidInstead: row.said_instead,
    resolvedAt: row.resolved_at ?? "",
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

export async function GET() {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ issues: [], status: cloudSaveStatus() })

  try {
    await ensureScriptIssuesSchema(sql)
    const rows = (await sql`
      SELECT id, show_id, show_date, link_title, hour, link_position, flagged_text, said_instead, resolved_at, created_at, updated_at
      FROM broadcastos_script_issues
      ORDER BY created_at DESC
      LIMIT 200
    `) as ScriptIssueRow[]
    return Response.json({ issues: rows.map(issueFromRow) })
  } catch (error) {
    return Response.json({ issues: [], error: error instanceof Error ? error.message : "Could not load script issues." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ saved: false, status: cloudSaveStatus() })

  try {
    const body = (await request.json()) as {
      id?: string
      showId?: string
      showDate?: string
      linkTitle?: string
      hour?: string
      linkPosition?: string
      flaggedText?: string
      saidInstead?: string
      resolvedAt?: string
    }
    if (!body.id || !body.linkTitle) {
      return Response.json({ saved: false, error: "An issue needs an id and a link title." }, { status: 400 })
    }

    await ensureScriptIssuesSchema(sql)
    await sql`
      INSERT INTO broadcastos_script_issues (id, show_id, show_date, link_title, hour, link_position, flagged_text, said_instead, resolved_at, updated_at)
      VALUES (
        ${body.id},
        ${body.showId ?? ""},
        ${body.showDate ?? ""},
        ${body.linkTitle},
        ${body.hour ?? ""},
        ${body.linkPosition ?? ""},
        ${body.flaggedText ?? ""},
        ${body.saidInstead ?? ""},
        ${body.resolvedAt?.trim() ? body.resolvedAt : null},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        flagged_text = EXCLUDED.flagged_text,
        said_instead = EXCLUDED.said_instead,
        resolved_at = EXCLUDED.resolved_at,
        updated_at = NOW()
    `
    return Response.json({ saved: true })
  } catch (error) {
    return Response.json({ saved: false, error: error instanceof Error ? error.message : "Could not save that issue." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ deleted: false, status: cloudSaveStatus() })

  try {
    const issueId = new URL(request.url).searchParams.get("issueId")
    if (!issueId) return Response.json({ deleted: false, error: "issueId is required." }, { status: 400 })

    await ensureScriptIssuesSchema(sql)
    await sql`DELETE FROM broadcastos_script_issues WHERE id = ${issueId}`
    return Response.json({ deleted: true })
  } catch (error) {
    return Response.json({ deleted: false, error: error instanceof Error ? error.message : "Could not delete that issue." }, { status: 500 })
  }
}
