import { getSessionUser } from "@/lib/auth-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const user = await getSessionUser(request)
  return Response.json({ user })
}
