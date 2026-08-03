import { getCloudSaveSql } from "@/lib/cloud-save-db"
import { clearedSessionCookie, destroySession } from "@/lib/auth-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (sql) await destroySession(sql, request)
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearedSessionCookie() } })
}
