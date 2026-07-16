import { neon } from "@neondatabase/serverless"

type BroadcastSql = ReturnType<typeof neon>

let sqlClient: BroadcastSql | null = null
let schemaReady = false

export type SavedShowSessionRow = {
  id: string
  title: string
  show_id: string
  show_date: string
  created_at: string
  updated_at: string
  item_count: number
}

export type SavedShowWorkspace = {
  mode?: string
  showId?: string
  date?: string
  items?: unknown[]
  messages?: unknown[]
  preShowPromo?: {
    whatsappStatus?: string
    videoScript?: string
  }
  updatedAt?: string
  [key: string]: unknown
}

export type PresenterHubImportRow = {
  id: string
  title: string
  kind: string
  source_label: string
  week_start: string
  show_name: string
  original_filename: string | null
  content: string
  created_at: string
}

export type ListenerLogRow = {
  id: string
  name_key: string
  display_name: string
  show_id: string
  show_date: string
  message_count: number
  source_counts: Record<string, number> | null
  created_at: string
  updated_at: string
}

export type ListenerProfileRow = {
  name_key: string
  display_name: string
  birthday: string | null
  favourite_song: string | null
  created_at: string
  updated_at: string
}

export type ListenerNoteRow = {
  id: string
  name_key: string
  tag: string
  content: string
  show_date: string | null
  created_at: string
}

export type PresenterHubLinerRow = {
  id: string
  title: string
  script: string
  week_start: string
  source_import_id: string | null
  shows_used: string[]
  usage_count: number
  first_used: string | null
  last_used: string | null
  status: string
  created_at: string
}

export function getCloudSaveSql() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!databaseUrl) return null

  sqlClient ??= neon(databaseUrl)
  return sqlClient
}

export function cloudSaveStatus() {
  return {
    databaseConfigured: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
    privateKeyConfigured: Boolean(process.env.BROADCASTOS_CLOUD_KEY),
  }
}

export function validateCloudSaveRequest(request: Request) {
  const requiredKey = process.env.BROADCASTOS_CLOUD_KEY
  if (!requiredKey) return null

  const suppliedKey = request.headers.get("x-broadcastos-cloud-key")
  if (suppliedKey === requiredKey) return null

  return Response.json(
    {
      error: "Cloud save key required",
      status: cloudSaveStatus(),
    },
    { status: 401 }
  )
}

export async function ensureCloudSaveSchema(sql: BroadcastSql) {
  if (schemaReady) return

  await sql`
    CREATE TABLE IF NOT EXISTS broadcastos_show_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      show_id TEXT NOT NULL,
      show_date TEXT NOT NULL,
      workspace JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS broadcastos_show_sessions_updated_at_idx
    ON broadcastos_show_sessions (updated_at DESC)
  `

  schemaReady = true
}

export async function ensurePresenterHubSchema(sql: BroadcastSql) {
  await ensureCloudSaveSchema(sql)

  await sql`
    CREATE TABLE IF NOT EXISTS broadcastos_presenter_imports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      kind TEXT NOT NULL,
      source_label TEXT NOT NULL,
      week_start TEXT NOT NULL,
      show_name TEXT NOT NULL,
      original_filename TEXT,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS broadcastos_presenter_imports_created_at_idx
    ON broadcastos_presenter_imports (created_at DESC)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS broadcastos_liner_archive (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      script TEXT NOT NULL,
      week_start TEXT NOT NULL,
      source_import_id TEXT,
      shows_used JSONB NOT NULL DEFAULT '[]'::jsonb,
      usage_count INTEGER NOT NULL DEFAULT 0,
      first_used TEXT,
      last_used TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS broadcastos_liner_archive_week_start_idx
    ON broadcastos_liner_archive (week_start DESC)
  `
}

export async function ensureListenerLogSchema(sql: BroadcastSql) {
  await sql`
    CREATE TABLE IF NOT EXISTS broadcastos_listener_log (
      id TEXT PRIMARY KEY,
      name_key TEXT NOT NULL,
      display_name TEXT NOT NULL,
      show_id TEXT NOT NULL,
      show_date TEXT NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (name_key, show_id, show_date)
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS broadcastos_listener_log_show_idx
    ON broadcastos_listener_log (show_date DESC, show_id)
  `

  await sql`
    ALTER TABLE broadcastos_listener_log
    ADD COLUMN IF NOT EXISTS source_counts JSONB NOT NULL DEFAULT '{}'::jsonb
  `

  await sql`
    CREATE TABLE IF NOT EXISTS broadcastos_listener_profiles (
      name_key TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      birthday TEXT,
      favourite_song TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS broadcastos_listener_notes (
      id TEXT PRIMARY KEY,
      name_key TEXT NOT NULL,
      tag TEXT NOT NULL DEFAULT 'keeper',
      content TEXT NOT NULL,
      show_date TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS broadcastos_listener_notes_name_idx
    ON broadcastos_listener_notes (name_key, created_at DESC)
  `
}
