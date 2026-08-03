import { getCloudSaveSql } from "@/lib/cloud-save-db"
import { createSession, findUserByEmail, sessionCookie, verifyPassword } from "@/lib/auth-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) return Response.json({ error: "Online storage is not available yet." }, { status: 503 })

  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""
  if (!email || !password) {
    return Response.json({ error: "Email and password are both needed." }, { status: 400 })
  }

  const found = await findUserByEmail(sql, email)
  const valid = found ? await verifyPassword(password, found.passwordHash) : false
  if (!found || !valid) {
    return Response.json({ error: "That email and password don't match." }, { status: 401 })
  }
  if (found.user.disabled) {
    return Response.json({ error: "This account has been switched off… speak to the owner." }, { status: 403 })
  }

  const session = await createSession(sql, found.user.id)
  return Response.json(
    { user: found.user },
    { headers: { "Set-Cookie": sessionCookie(session.token, session.expires) } }
  )
}
