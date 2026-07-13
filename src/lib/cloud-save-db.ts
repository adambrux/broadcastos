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
  updatedAt?: string
  [key: string]: unknown
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
