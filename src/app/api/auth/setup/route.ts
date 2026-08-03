import { getCloudSaveSql } from "@/lib/cloud-save-db"
import {
  claimLegacyRows,
  countUsers,
  createSession,
  createUser,
  sessionCookie,
} from "@/lib/auth-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ needsSetup: false, databaseConfigured: false })
  const users = await countUsers(sql)
  return Response.json({ needsSetup: users === 0, databaseConfigured: true })
}

/** One-time: creates the owner account and hands every existing saved show,
 * listener and scoreboard to it. Only works while no accounts exist. */
export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not available yet." }, { status: 503 })

  const body = await request.json().catch(() => null) as { displayName?: string; email?: string; password?: string } | null
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : ""
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!displayName || !email.includes("@") || password.length < 8) {
    return Response.json({ error: "A name, a real email and a password of at least 8 characters are needed." }, { status: 400 })
  }

  const existing = await countUsers(sql)
  if (existing > 0) {
    return Response.json({ error: "The owner account already exists… sign in instead." }, { status: 409 })
  }

  const ownerId = await createUser(sql, { displayName, email, password, role: "owner" })
  await claimLegacyRows(sql, ownerId)

  const session = await createSession(sql, ownerId)
  return Response.json(
    { user: { id: ownerId, email, displayName, role: "owner", disabled: false } },
    { headers: { "Set-Cookie": sessionCookie(session.token, session.expires) } }
  )
}
