import {
  cloudSaveStatus,
  ensurePresenterHubSchema,
  getCloudSaveSql,
  type PresenterHubImportRow,
  type PresenterHubLinerRow,
} from "@/lib/cloud-save-db"
import {
  applyLinerUsage,
  createLinerFromText,
  extractLikelyLiners,
  friendlyImportTitle,
  mockLiners,
  mockPresenterImports,
  type LinerArchiveItem,
  type PresenterHubImport,
  type PresenterHubImportKind,
  type PresenterHubSource,
} from "@/lib/presenter-hub"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type PresenterHubPayload = {
  kind?: PresenterHubImportKind
  sourceLabel?: PresenterHubSource
  showName?: string
  weekStart?: string
  originalFilename?: string
  content?: string
  title?: string
}

function importFromRow(row: PresenterHubImportRow): PresenterHubImport {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind as PresenterHubImportKind,
    sourceLabel: row.source_label as PresenterHubSource,
    weekStart: row.week_start,
    showName: row.show_name,
    originalFilename: row.original_filename ?? undefined,
    content: row.content,
    createdAt: row.created_at,
  }
}

function linerFromRow(row: PresenterHubLinerRow): LinerArchiveItem {
  return {
    id: row.id,
    title: row.title,
    script: row.script,
    weekStart: row.week_start,
    sourceImportId: row.source_import_id ?? undefined,
    showsUsed: Array.isArray(row.shows_used) ? row.shows_used : [],
    usageCount: row.usage_count,
    firstUsed: row.first_used ?? undefined,
    lastUsed: row.last_used ?? undefined,
    status: row.status as LinerArchiveItem["status"],
    createdAt: row.created_at,
  }
}

function normalisePayload(value: unknown): PresenterHubPayload {
  if (!value || typeof value !== "object") return {}
  return value as PresenterHubPayload
}

function defaultSource(kind: PresenterHubImportKind): PresenterHubSource {
  if (kind === "weekly-brief") return "Weekly brief"
  if (kind === "show-script") return "Show script"
  if (kind === "liner") return "Station supplied"
  if (kind === "file") return "Uploaded file"
  return "Manual paste"
}

export async function GET() {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({
      imports: mockPresenterImports,
      liners: applyLinerUsage(mockLiners, mockPresenterImports),
      status: cloudSaveStatus(),
      storageMode: "Mock fallback",
    })
  }

  await ensurePresenterHubSchema(sql)

  const importRows = await sql`
    SELECT id, title, kind, source_label, week_start, show_name, original_filename, content, created_at
    FROM broadcastos_presenter_imports
    ORDER BY created_at DESC
    LIMIT 80
  ` as PresenterHubImportRow[]

  const linerRows = await sql`
    SELECT id, title, script, week_start, source_import_id, shows_used, usage_count, first_used, last_used, status, created_at
    FROM broadcastos_liner_archive
    ORDER BY week_start DESC, created_at DESC
    LIMIT 80
  ` as PresenterHubLinerRow[]

  const imports = importRows.map(importFromRow)
  const liners = applyLinerUsage(linerRows.map(linerFromRow), imports)

  return Response.json({
    imports,
    liners,
    status: cloudSaveStatus(),
    storageMode: "Database",
  })
}

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json(
      { error: "Database is not configured", status: cloudSaveStatus() },
      { status: 503 }
    )
  }

  await ensurePresenterHubSchema(sql)

  const body = normalisePayload(await request.json().catch(() => null))
  const kind = body.kind ?? "weekly-brief"
  const weekStart = body.weekStart || new Date().toISOString().slice(0, 10)
  const showName = body.showName || "Premier Gospel"
  const content = typeof body.content === "string" ? body.content.trim() : ""

  if (!content) {
    return Response.json({ error: "Paste or upload some content first." }, { status: 400 })
  }

  const id = crypto.randomUUID()
  const title = body.title?.trim() || friendlyImportTitle(kind, showName, weekStart, body.originalFilename)
  const sourceLabel = body.sourceLabel ?? defaultSource(kind)
  const createdAt = new Date().toISOString()

  const importRows = await sql`
    INSERT INTO broadcastos_presenter_imports (id, title, kind, source_label, week_start, show_name, original_filename, content, created_at)
    VALUES (${id}, ${title}, ${kind}, ${sourceLabel}, ${weekStart}, ${showName}, ${body.originalFilename ?? null}, ${content}, ${createdAt})
    RETURNING id, title, kind, source_label, week_start, show_name, original_filename, content, created_at
  ` as PresenterHubImportRow[]

  const extracted = kind === "weekly-brief" || kind === "liner"
    ? extractLikelyLiners(content, weekStart, id)
    : []
  if (kind === "liner" && extracted.length === 0) {
    extracted.push(createLinerFromText(content, weekStart, id))
  }

  for (const liner of extracted) {
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
    `
  }

  const savedImport = importRows.at(0)

  return Response.json({
    import: savedImport ? importFromRow(savedImport) : null,
    extractedLiners: extracted,
    status: cloudSaveStatus(),
  })
}
