import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto"
import { getCloudSaveSql } from "@/lib/cloud-save-db"

type BroadcastSql = NonNullable<ReturnType<typeof getCloudSaveSql>>

const SESSION_COOKIE = "broadcastos_session"
const SESSION_DAYS = 120

let authSchemaReady = false

export type AppUser = {
  id: string
  email: string
  displayName: string
  role: "owner" | "presenter"
  disabled: boolean
  /** Presenter's own show name; the owner uses the built-in shows. */
  showName: string | null
  /** The Arcade and monthly leaderboard: on for the owner, off by default for presenters. */
  arcadeEnabled: boolean
}

type UserRow = {
  id: string
  email: string
  display_name: string
  role: string
  disabled: boolean
  password_hash: string
  show_name: string | null
  arcade_enabled: boolean | null
}

function scrypt(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, derived) => {
      if (error) reject(error)
      else resolve(derived)
    })
  })
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt)
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split(":")
  if (parts.length !== 3 || parts[0] !== "scrypt") return false
  const salt = Buffer.from(parts[1], "hex")
  const expected = Buffer.from(parts[2], "hex")
  const derived = await scrypt(password, salt)
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Tables that hold per-presenter data. Every one gains an owner column, and
 * shared-uniqueness constraints from the single-user era are widened so two
 * presenters can each know their own "Steph".
 */
const scopedTables = [
  "broadcastos_show_sessions",
  "broadcastos_presenter_imports",
  "broadcastos_liner_archive",
  "broadcastos_game_scores",
  "broadcastos_script_issues",
  "broadcastos_listener_log",
  "broadcastos_listener_profiles",
  "broadcastos_listener_notes",
] as const

export async function ensureAuthSchema(sql: BroadcastSql) {
  if (authSchemaReady) return

  await sql`
    CREATE TABLE IF NOT EXISTS broadcastos_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'presenter',
      password_hash TEXT NOT NULL,
      disabled BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`ALTER TABLE broadcastos_users ADD COLUMN IF NOT EXISTS show_name TEXT`
  await sql`ALTER TABLE broadcastos_users ADD COLUMN IF NOT EXISTS arcade_enabled BOOLEAN`

  await sql`
    CREATE TABLE IF NOT EXISTS broadcastos_auth_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `

  for (const table of scopedTables) {
    await sql.query(`ALTER TABLE IF EXISTS ${table} ADD COLUMN IF NOT EXISTS user_id TEXT`)
  }

  // The single-user era enforced uniqueness without an owner. Widen those.
  await sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'broadcastos_listener_log_name_key_show_id_show_date_key') THEN
        ALTER TABLE broadcastos_listener_log DROP CONSTRAINT broadcastos_listener_log_name_key_show_id_show_date_key;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'broadcastos_game_scores_name_key_show_id_show_date_key') THEN
        ALTER TABLE broadcastos_game_scores DROP CONSTRAINT broadcastos_game_scores_name_key_show_id_show_date_key;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'broadcastos_listener_profiles_pkey') THEN
        ALTER TABLE broadcastos_listener_profiles DROP CONSTRAINT broadcastos_listener_profiles_pkey;
      END IF;
    END $$
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS broadcastos_listener_log_user_show_idx
    ON broadcastos_listener_log (user_id, name_key, show_id, show_date)
  `
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS broadcastos_game_scores_user_show_idx
    ON broadcastos_game_scores (user_id, name_key, show_id, show_date)
  `
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS broadcastos_listener_profiles_user_idx
    ON broadcastos_listener_profiles (user_id, name_key)
  `

  authSchemaReady = true
}

/** Everything saved before accounts existed belongs to the owner. */
export async function claimLegacyRows(sql: BroadcastSql, ownerId: string) {
  for (const table of scopedTables) {
    await sql.query(`UPDATE ${table} SET user_id = $1 WHERE user_id IS NULL`, [ownerId])
  }
}

export async function countUsers(sql: BroadcastSql) {
  await ensureAuthSchema(sql)
  const rows = await sql`SELECT COUNT(*)::int AS count FROM broadcastos_users` as { count: number }[]
  return rows.at(0)?.count ?? 0
}

function userFromRow(row: UserRow): AppUser {
  const role = row.role === "owner" ? "owner" : "presenter"
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role,
    disabled: Boolean(row.disabled),
    showName: row.show_name ?? null,
    arcadeEnabled: row.arcade_enabled ?? role === "owner",
  }
}

export async function findUserByEmail(sql: BroadcastSql, email: string) {
  await ensureAuthSchema(sql)
  const rows = await sql`
    SELECT id, email, display_name, role, disabled, password_hash, show_name, arcade_enabled
    FROM broadcastos_users
    WHERE email = ${email.toLowerCase().trim()}
    LIMIT 1
  ` as UserRow[]
  const row = rows.at(0)
  return row ? { user: userFromRow(row), passwordHash: row.password_hash } : null
}

export async function createUser(
  sql: BroadcastSql,
  input: { email: string; displayName: string; password: string; role: "owner" | "presenter"; showName?: string; arcadeEnabled?: boolean }
) {
  await ensureAuthSchema(sql)
  const id = crypto.randomUUID()
  const passwordHash = await hashPassword(input.password)
  const arcade = input.arcadeEnabled ?? (input.role === "owner")
  await sql`
    INSERT INTO broadcastos_users (id, email, display_name, role, password_hash, show_name, arcade_enabled)
    VALUES (${id}, ${input.email.toLowerCase().trim()}, ${input.displayName.trim()}, ${input.role}, ${passwordHash}, ${input.showName?.trim() || null}, ${arcade})
  `
  return id
}

export async function createSession(sql: BroadcastSql, userId: string) {
  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await sql`
    INSERT INTO broadcastos_auth_sessions (token_hash, user_id, expires_at)
    VALUES (${hashToken(token)}, ${userId}, ${expires.toISOString()})
  `
  return { token, expires }
}

export function sessionCookie(token: string, expires: Date) {
  const maxAge = Math.floor((expires.getTime() - Date.now()) / 1000)
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
}

export function clearedSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

function tokenFromRequest(request: Request) {
  const header = request.headers.get("cookie") ?? ""
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=")
    if (name === SESSION_COOKIE) return rest.join("=")
  }
  return ""
}

export async function destroySession(sql: BroadcastSql, request: Request) {
  const token = tokenFromRequest(request)
  if (!token) return
  await ensureAuthSchema(sql)
  await sql`DELETE FROM broadcastos_auth_sessions WHERE token_hash = ${hashToken(token)}`
}

export async function getSessionUser(request: Request): Promise<AppUser | null> {
  const sql = getCloudSaveSql()
  if (!sql) return null
  const token = tokenFromRequest(request)
  if (!token) return null

  await ensureAuthSchema(sql)
  const rows = await sql`
    SELECT u.id, u.email, u.display_name, u.role, u.disabled, u.password_hash, u.show_name, u.arcade_enabled
    FROM broadcastos_auth_sessions s
    JOIN broadcastos_users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)} AND s.expires_at > NOW()
    LIMIT 1
  ` as UserRow[]
  const row = rows.at(0)
  if (!row || row.disabled) return null
  return userFromRow(row)
}

/**
 * Every data route calls this first: a signed-in, enabled account or a 401.
 * Presenter data is private… the listener log holds pastoral moments, so
 * nothing is ever served without knowing exactly whose workspace it is.
 */
export async function requireUser(request: Request): Promise<{ user: AppUser } | { response: Response }> {
  const user = await getSessionUser(request)
  if (!user) {
    return { response: Response.json({ error: "Sign in to use BroadcastOS." }, { status: 401 }) }
  }
  return { user }
}
