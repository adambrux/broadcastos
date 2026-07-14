import {
  cloudSaveStatus,
  ensureCloudSaveSchema,
  ensurePresenterHubSchema,
  getCloudSaveSql,
  validateCloudSaveRequest,
  type PresenterHubLinerRow,
  type SavedShowSessionRow,
  type SavedShowWorkspace,
} from "@/lib/cloud-save-db"
import {
  extractLikelyLiners,
  friendlyImportTitle,
  serialiseShowPlanForPresenterHub,
  weekStartFromDate,
} from "@/lib/presenter-hub"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type SavedShowSessionSaveRow = {
  id: string
  title: string
  show_id: string
  show_date: string
  created_at: string
  updated_at: string
}

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

function normaliseForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()
}

function parseShowsUsed(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function mergeShows(existing: string[], incoming: string[]) {
  return Array.from(new Set([...existing, ...incoming].map((show) => show.trim()).filter(Boolean)))
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

  await ensurePresenterHubSchema(sql)

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
  ` as SavedShowSessionSaveRow[]

  const [session] = rows

  const showDisplayName = showName(showId)
  const weekStart = weekStartFromDate(showDate)
  const showScriptContent = serialiseShowPlanForPresenterHub(workspace)
  const presenterImportId = `show-session-${id}`

  if (showScriptContent.trim()) {
    const importTitle = friendlyImportTitle("show-script", showDisplayName, weekStart)

    await sql`
      INSERT INTO broadcastos_presenter_imports (id, title, kind, source_label, week_start, show_name, original_filename, content, created_at)
      VALUES (${presenterImportId}, ${importTitle}, ${"show-script"}, ${"Show script"}, ${weekStart}, ${showDisplayName}, ${null}, ${showScriptContent}, ${new Date().toISOString()})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        kind = EXCLUDED.kind,
        source_label = EXCLUDED.source_label,
        week_start = EXCLUDED.week_start,
        show_name = EXCLUDED.show_name,
        content = EXCLUDED.content
    `

    const extracted = extractLikelyLiners(showScriptContent, weekStart, presenterImportId, {
      showName: showDisplayName,
      usedInShow: true,
    })

    const existingRows = await sql`
      SELECT id, title, script, week_start, source_import_id, shows_used, usage_count, first_used, last_used, status, created_at
      FROM broadcastos_liner_archive
      WHERE week_start = ${weekStart}
    ` as PresenterHubLinerRow[]

    const existingLiners = existingRows.map((row) => ({
      id: row.id,
      title: row.title,
      script: row.script,
      showsUsed: parseShowsUsed(row.shows_used),
      usageCount: row.usage_count,
      firstUsed: row.first_used,
      lastUsed: row.last_used,
    }))

    for (const liner of extracted) {
      const linerTitle = normaliseForMatch(liner.title)
      const linerScript = normaliseForMatch(liner.script)
      const existing = existingLiners.find((item) => {
        const title = normaliseForMatch(item.title)
        const script = normaliseForMatch(item.script)
        return title === linerTitle || (title.length > 12 && linerScript.includes(title)) || (linerTitle.length > 12 && script.includes(linerTitle))
      })

      if (existing) {
        const showsUsed = mergeShows(existing.showsUsed, liner.showsUsed)
        const extraUsage = liner.showsUsed.some((show) => !existing.showsUsed.includes(show)) ? liner.usageCount : 0
        const usageCount = Math.max(existing.usageCount, existing.usageCount + extraUsage, liner.usageCount)

        await sql`
          UPDATE broadcastos_liner_archive
          SET
            shows_used = ${JSON.stringify(showsUsed)}::jsonb,
            usage_count = ${usageCount},
            first_used = COALESCE(first_used, ${liner.firstUsed ?? null}),
            last_used = COALESCE(${liner.lastUsed ?? null}, last_used),
            status = ${liner.status}
          WHERE id = ${existing.id}
        `
      } else {
        await sql`
          INSERT INTO broadcastos_liner_archive (id, title, script, week_start, source_import_id, shows_used, usage_count, first_used, last_used, status, created_at)
          VALUES (
            ${liner.id},
            ${liner.title},
            ${liner.script},
            ${liner.weekStart},
            ${liner.sourceImportId ?? null},
            ${JSON.stringify(liner.showsUsed)}::jsonb,
            ${liner.usageCount},
            ${liner.firstUsed ?? null},
            ${liner.lastUsed ?? null},
            ${liner.status},
            ${liner.createdAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            script = EXCLUDED.script,
            shows_used = EXCLUDED.shows_used,
            usage_count = EXCLUDED.usage_count,
            first_used = EXCLUDED.first_used,
            last_used = EXCLUDED.last_used,
            status = EXCLUDED.status
        `
        existingLiners.push({
          id: liner.id,
          title: liner.title,
          script: liner.script,
          showsUsed: liner.showsUsed,
          usageCount: liner.usageCount,
          firstUsed: liner.firstUsed ?? null,
          lastUsed: liner.lastUsed ?? null,
        })
      }
    }
  }

  return Response.json({ session, status: cloudSaveStatus() })
}
