import { getCloudSaveSql } from "@/lib/cloud-save-db"

type BroadcastSql = NonNullable<ReturnType<typeof getCloudSaveSql>>

let settingsSchemaReady = false

/** Small per-account settings (v2.46): the missing list's start date, and whatever comes next. */
export async function ensureSettingsSchema(sql: BroadcastSql) {
  if (settingsSchemaReady) return
  await sql`
    CREATE TABLE IF NOT EXISTS broadcastos_settings (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, key)
    )
  `
  settingsSchemaReady = true
}

export async function getSetting(sql: BroadcastSql, userId: string, key: string) {
  await ensureSettingsSchema(sql)
  const rows = await sql`SELECT value FROM broadcastos_settings WHERE user_id = ${userId} AND key = ${key} LIMIT 1` as { value: string }[]
  return rows.at(0)?.value ?? null
}

export async function setSetting(sql: BroadcastSql, userId: string, key: string, value: string) {
  await ensureSettingsSchema(sql)
  await sql`
    INSERT INTO broadcastos_settings (user_id, key, value) VALUES (${userId}, ${key}, ${value})
    ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `
}

/** The missing list starts counting from this day; nobody is missing before it. Set on 23 Nov 2026 to the next show day. */
export const MIA_FLOOR_KEY = "miaFloor"
export const DEFAULT_MIA_FLOOR = "2026-11-24"
