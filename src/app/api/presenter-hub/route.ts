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

type StructuredLinerPayload = {
  title?: string
  script?: string
}

type PresenterHubPayload = {
  kind?: PresenterHubImportKind
  sourceLabel?: PresenterHubSource
  showName?: string
  weekStart?: string
  usageDate?: string
  originalFilename?: string
  content?: string
  title?: string
  liners?: StructuredLinerPayload[]
}

// Neon returns TIMESTAMPTZ columns as Date objects; the app works in ISO strings.
function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string") return value
  return new Date(String(value)).toISOString()
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
    createdAt: toIso(row.created_at),
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
    createdAt: toIso(row.created_at),
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

function normaliseForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()
}

function mergeShows(existing: string[], incoming: string[]) {
  return Array.from(new Set([...existing, ...incoming].map((show) => show.trim()).filter(Boolean)))
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown storage error"
}

function findMatchingLiner(existingLiners: LinerArchiveItem[], title: string, script: string) {
  const linerTitle = normaliseForMatch(title)
  const linerScript = normaliseForMatch(script)
  return existingLiners.find((item) => {
    const itemTitle = normaliseForMatch(item.title)
    const itemScript = normaliseForMatch(item.script)
    return itemTitle === linerTitle
      || (itemTitle.length > 12 && linerScript.includes(itemTitle))
      || (linerTitle.length > 12 && itemScript.includes(linerTitle))
      || (linerScript.length > 24 && itemScript.length > 24 && (linerScript.includes(itemScript) || itemScript.includes(linerScript)))
  })
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

  try {
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
    // Stored counts are authoritative: reads are counted once per show day at
    // import time, so no fuzzy text-matching on the way out.
    const liners = linerRows.map(linerFromRow)

    return Response.json({
      imports,
      liners,
      status: cloudSaveStatus(),
      storageMode: "Database",
    })
  } catch (error) {
    return Response.json({
      imports: [],
      liners: [],
      status: cloudSaveStatus(),
      storageMode: "Database error",
      error: errorMessage(error),
    })
  }
}

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json(
      { error: "Online storage is not configured yet.", status: cloudSaveStatus() },
      { status: 503 }
    )
  }

  try {
    await ensurePresenterHubSchema(sql)

    const body = normalisePayload(await request.json().catch(() => null))
    const kind = body.kind ?? "weekly-brief"
    const weekStart = body.weekStart || new Date().toISOString().slice(0, 10)
    const usageDate = body.usageDate || new Date().toISOString().slice(0, 10)
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

    // Structured liners come straight from the parsed show plan: the importer
    // already knows exactly which links are liner links, so no keyword guessing.
    const structured = (Array.isArray(body.liners) ? body.liners : [])
      .map((liner) => ({
        title: typeof liner?.title === "string" ? liner.title.trim() : "",
        script: typeof liner?.script === "string" ? liner.script.trim() : "",
      }))
      .filter((liner) => liner.title || liner.script)

    // Show scripts NEVER use keyword extraction: their liner links arrive
    // structurally. Keyword guessing is only for weekly briefs and single liners.
    const extracted: LinerArchiveItem[] = structured.length || kind === "show-script"
      ? []
      : kind === "weekly-brief" || kind === "liner"
        ? extractLikelyLiners(content, weekStart, id, { showName })
        : []
    if (kind === "liner" && !structured.length && extracted.length === 0) {
      extracted.push(createLinerFromText(content, weekStart, id, { showName }))
    }

    const existingRows = await sql`
      SELECT id, title, script, week_start, source_import_id, shows_used, usage_count, first_used, last_used, status, created_at
      FROM broadcastos_liner_archive
      WHERE week_start = ${weekStart}
    ` as PresenterHubLinerRow[]
    const existingLiners = existingRows.map(linerFromRow)
    const savedLiners: LinerArchiveItem[] = []

    for (const liner of structured) {
      const linerTitle = liner.title || liner.script.split(/[.!?]/)[0].slice(0, 74).trim() || "Station liner"
      const linerScript = liner.script || liner.title
      const existing = findMatchingLiner(existingLiners, linerTitle, linerScript)

      if (existing) {
        // One read per show day: importing the same script twice does not double-count.
        const alreadyCountedToday = existing.lastUsed === usageDate
        const usageCount = alreadyCountedToday ? existing.usageCount : existing.usageCount + 1
        const showsUsed = mergeShows(existing.showsUsed, [showName])
        await sql`
          UPDATE broadcastos_liner_archive
          SET
            shows_used = ${JSON.stringify(showsUsed)}::jsonb,
            usage_count = ${usageCount},
            first_used = COALESCE(first_used, ${usageDate}),
            last_used = ${usageDate},
            status = 'Active'
          WHERE id = ${existing.id}
        `
        savedLiners.push({ ...existing, showsUsed, usageCount, lastUsed: usageDate, firstUsed: existing.firstUsed ?? usageDate })
      } else {
        const created: LinerArchiveItem = {
          id: crypto.randomUUID(),
          title: linerTitle,
          script: linerScript,
          weekStart,
          sourceImportId: id,
          showsUsed: [showName],
          usageCount: 1,
          firstUsed: usageDate,
          lastUsed: usageDate,
          status: "Active",
          createdAt: new Date().toISOString(),
        }
        await sql`
          INSERT INTO broadcastos_liner_archive (id, title, script, week_start, source_import_id, shows_used, usage_count, first_used, last_used, status, created_at)
          VALUES (${created.id}, ${created.title}, ${created.script}, ${created.weekStart}, ${id}, ${JSON.stringify(created.showsUsed)}::jsonb, 1, ${usageDate}, ${usageDate}, 'Active', ${created.createdAt})
        `
        existingLiners.push(created)
        savedLiners.push(created)
      }
    }

    for (const liner of extracted) {
      const existing = findMatchingLiner(existingLiners, liner.title, liner.script)

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
        savedLiners.push({ ...existing, showsUsed, usageCount })
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
        `
        existingLiners.push(liner)
        savedLiners.push(liner)
      }
    }

    const savedImport = importRows.at(0)

    return Response.json({
      import: savedImport ? importFromRow(savedImport) : null,
      extractedLiners: savedLiners,
      status: cloudSaveStatus(),
    })
  } catch (error) {
    return Response.json(
      { error: errorMessage(error), status: cloudSaveStatus() },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ error: "Online storage is not configured yet.", status: cloudSaveStatus() }, { status: 503 })
  }

  try {
    await ensurePresenterHubSchema(sql)

    const url = new URL(request.url)
    const linerId = url.searchParams.get("linerId")
    const importId = url.searchParams.get("importId")
    if (!linerId && !importId) {
      return Response.json({ error: "linerId or importId is needed." }, { status: 400 })
    }

    if (linerId) await sql`DELETE FROM broadcastos_liner_archive WHERE id = ${linerId}`
    if (importId) await sql`DELETE FROM broadcastos_presenter_imports WHERE id = ${importId}`
    return Response.json({ ok: true, status: cloudSaveStatus() })
  } catch (error) {
    return Response.json({ error: errorMessage(error), status: cloudSaveStatus() }, { status: 500 })
  }
}
