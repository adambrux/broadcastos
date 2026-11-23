import { getCloudSaveSql, type PresenterHubLinerRow, type SavedShowWorkspace } from "@/lib/cloud-save-db"
import type { AppUser } from "@/lib/auth-db"
import {
  extractLinerLinksFromShowItems,
  friendlyImportTitle,
  serialiseShowPlanForPresenterHub,
  weekStartFromDate,
} from "@/lib/presenter-hub"

/**
 * One place that writes a saved show and archives it to the Presenter Hub.
 * Save online (the Producer Desk) and the inbox (a plan sent straight from the
 * producer's machine, v2.39) both land here, so a show saved either way looks
 * exactly the same on the studio iPad.
 */

type BroadcastSql = NonNullable<ReturnType<typeof getCloudSaveSql>>

export type SavedShowSessionSaveRow = {
  id: string
  title: string
  show_id: string
  show_date: string
  created_at: string
  updated_at: string
}

export function showDisplayNameFor(showId: unknown) {
  if (showId === "sundays") return "Sundays with Adam"
  if (showId === "saturday") return "Saturday Breakfast"
  if (showId === "gospel-breakfast") return "Gospel Breakfast"
  return "Afternoons with Adam"
}

export function defaultSessionTitle(workspace: SavedShowWorkspace) {
  const date = typeof workspace.date === "string" && workspace.date ? workspace.date : "Undated"
  return `${showDisplayNameFor(workspace.showId)} · ${date}`
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

/** Writes (or overwrites, when the id is already this account's) one saved show row. */
export async function saveShowSessionRow(
  sql: BroadcastSql,
  userId: string,
  input: { id: string; title: string; workspace: SavedShowWorkspace }
) {
  const { id, title, workspace } = input
  const showId = typeof workspace.showId === "string" && workspace.showId ? workspace.showId : "afternoons"
  const showDate = typeof workspace.date === "string" && workspace.date ? workspace.date : new Date().toISOString().slice(0, 10)
  const workspaceJson = JSON.stringify({ ...workspace, updatedAt: new Date().toISOString() })

  const rows = await sql`
    INSERT INTO broadcastos_show_sessions (id, user_id, title, show_id, show_date, workspace)
    VALUES (${id}, ${userId}, ${title}, ${showId}, ${showDate}, ${workspaceJson}::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      show_id = EXCLUDED.show_id,
      show_date = EXCLUDED.show_date,
      workspace = EXCLUDED.workspace,
      updated_at = NOW()
    WHERE broadcastos_show_sessions.user_id = ${userId}
    RETURNING id, title, show_id, show_date, created_at, updated_at
  ` as SavedShowSessionSaveRow[]

  // No row back means the id belongs to another account (the WHERE stopped the update).
  return { session: rows.at(0) ?? null, showId, showDate }
}

/**
 * The Presenter Hub archive: a script copy of the show plus one liner read per
 * show day for every structurally marked liner link. Saving the same show twice
 * never double-counts.
 */
export async function archiveShowSessionToPresenterHub(
  sql: BroadcastSql,
  input: { user: AppUser; id: string; showId: string; showDate: string; workspace: SavedShowWorkspace }
) {
  const { user, id, showId, showDate, workspace } = input
  const userId = user.id
  const showDisplayName = user.role !== "owner" && user.showName ? user.showName : showDisplayNameFor(showId)
  const weekStart = weekStartFromDate(showDate)
  const showScriptContent = serialiseShowPlanForPresenterHub(workspace)
  const presenterImportId = `show-session-${id}`
  let liners = 0

  if (!showScriptContent.trim()) return { importSaved: false, liners }

  const importTitle = friendlyImportTitle("show-script", showDisplayName, weekStart)

  await sql`
    INSERT INTO broadcastos_presenter_imports (id, user_id, title, kind, source_label, week_start, show_name, original_filename, content, created_at)
    VALUES (${presenterImportId}, ${userId}, ${importTitle}, ${"show-script"}, ${"Show script"}, ${weekStart}, ${showDisplayName}, ${null}, ${showScriptContent}, ${new Date().toISOString()})
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      kind = EXCLUDED.kind,
      source_label = EXCLUDED.source_label,
      week_start = EXCLUDED.week_start,
      show_name = EXCLUDED.show_name,
      content = EXCLUDED.content
  `

  // Only structurally marked liner links are archived… never keyword guesses.
  const extracted = extractLinerLinksFromShowItems(Array.isArray(workspace.items) ? workspace.items : [])

  const existingRows = await sql`
    SELECT id, title, script, week_start, source_import_id, shows_used, usage_count, first_used, last_used, status, created_at
    FROM broadcastos_liner_archive
    WHERE week_start = ${weekStart} AND user_id = ${userId}
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
    liners += 1
    const linerTitle = normaliseForMatch(liner.title)
    const linerScript = normaliseForMatch(liner.script)
    const existing = existingLiners.find((item) => {
      const title = normaliseForMatch(item.title)
      const script = normaliseForMatch(item.script)
      return title === linerTitle
        || (title.length > 12 && linerScript.includes(title))
        || (linerTitle.length > 12 && script.includes(linerTitle))
        || (linerScript.length > 24 && script.length > 24 && (linerScript.includes(script) || script.includes(linerScript)))
    })

    if (existing) {
      // One read per show day: saving the same show twice never double-counts.
      const alreadyCountedToday = existing.lastUsed === showDate
      const usageCount = alreadyCountedToday ? existing.usageCount : existing.usageCount + 1
      const showsUsed = mergeShows(existing.showsUsed, [showDisplayName])

      await sql`
        UPDATE broadcastos_liner_archive
        SET
          shows_used = ${JSON.stringify(showsUsed)}::jsonb,
          usage_count = ${usageCount},
          first_used = COALESCE(first_used, ${showDate}),
          last_used = ${showDate},
          status = 'Active'
        WHERE id = ${existing.id} AND user_id = ${userId}
      `
    } else {
      const newLinerId = crypto.randomUUID()
      await sql`
        INSERT INTO broadcastos_liner_archive (id, user_id, title, script, week_start, source_import_id, shows_used, usage_count, first_used, last_used, status, created_at)
        VALUES (
          ${newLinerId},
          ${userId},
          ${liner.title},
          ${liner.script},
          ${weekStart},
          ${presenterImportId},
          ${JSON.stringify([showDisplayName])}::jsonb,
          1,
          ${showDate},
          ${showDate},
          'Active',
          ${new Date().toISOString()}
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
        id: newLinerId,
        title: liner.title,
        script: liner.script,
        showsUsed: [showDisplayName],
        usageCount: 1,
        firstUsed: showDate,
        lastUsed: showDate,
      })
    }
  }

  return { importSaved: true, liners }
}
