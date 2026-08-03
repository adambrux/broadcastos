import { getCloudSaveSql } from "@/lib/cloud-save-db"
import { createUser, ensureAuthSchema, hashPassword, requireUser } from "@/lib/auth-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ManagedUserRow = {
  id: string
  email: string
  display_name: string
  role: string
  disabled: boolean
  created_at: unknown
}

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  return value ? String(value) : ""
}

export async function GET(request: Request) {
  const auth = await requireUser(request)
  if ("response" in auth) return auth.response
  if (auth.user.role !== "owner") return Response.json({ error: "Owner only." }, { status: 403 })

  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ users: [] })
  await ensureAuthSchema(sql)

  const rows = await sql`
    SELECT id, email, display_name, role, disabled, created_at
    FROM broadcastos_users
    ORDER BY created_at ASC
  ` as ManagedUserRow[]

  return Response.json({
    users: rows.map((row) => ({
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      disabled: Boolean(row.disabled),
      createdAt: toIso(row.created_at),
    })),
  })
}

export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ("response" in auth) return auth.response
  if (auth.user.role !== "owner") return Response.json({ error: "Owner only." }, { status: 403 })

  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not available yet." }, { status: 503 })

  const body = await request.json().catch(() => null) as { displayName?: string; email?: string; password?: string } | null
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : ""
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!displayName || !email.includes("@") || password.length < 8) {
    return Response.json({ error: "A name, a real email and a password of at least 8 characters are needed." }, { status: 400 })
  }

  try {
    const id = await createUser(sql, { displayName, email, password, role: "presenter" })
    return Response.json({ user: { id, email, displayName, role: "presenter", disabled: false } })
  } catch {
    return Response.json({ error: "That email already has an account." }, { status: 409 })
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request)
  if ("response" in auth) return auth.response

  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not available yet." }, { status: 503 })
  await ensureAuthSchema(sql)

  const body = await request.json().catch(() => null) as {
    userId?: string
    disabled?: boolean
    newPassword?: string
  } | null
  const userId = typeof body?.userId === "string" ? body.userId : ""
  if (!userId) return Response.json({ error: "userId is needed." }, { status: 400 })

  const changingSelf = userId === auth.user.id
  if (!changingSelf && auth.user.role !== "owner") {
    return Response.json({ error: "Owner only." }, { status: 403 })
  }

  if (typeof body?.disabled === "boolean") {
    if (changingSelf) return Response.json({ error: "You can't switch off your own account." }, { status: 400 })
    await sql`UPDATE broadcastos_users SET disabled = ${body.disabled} WHERE id = ${userId} AND role <> 'owner'`
    if (body.disabled) {
      await sql`DELETE FROM broadcastos_auth_sessions WHERE user_id = ${userId}`
    }
  }

  if (typeof body?.newPassword === "string" && body.newPassword) {
    if (body.newPassword.length < 8) {
      return Response.json({ error: "Passwords need at least 8 characters." }, { status: 400 })
    }
    const passwordHash = await hashPassword(body.newPassword)
    await sql`UPDATE broadcastos_users SET password_hash = ${passwordHash} WHERE id = ${userId}`
    // A fresh password signs everyone else out of that account.
    await sql`DELETE FROM broadcastos_auth_sessions WHERE user_id = ${userId}`
  }

  return Response.json({ ok: true })
}
