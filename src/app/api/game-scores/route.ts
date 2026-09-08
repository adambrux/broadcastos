import {
  cloudSaveStatus,
  ensureGameScoreSchema,
  getCloudSaveSql,
} from "@/lib/cloud-save-db"
import { requireUser } from "@/lib/auth-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function nameKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, " ").trim()
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown storage error"
}

type StandingRow = {
  name_key: string
  display_name: string
  points: number
  bonus_points: number
  days_played: number
  wins: number
  last_played: string
}

const monthPattern = /^\d{4}-\d{2}$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/

function ukMonth() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" }).slice(0, 7)
}

/**
 * The monthly Arcade master leaderboard: every day's final scoreboard is
 * mirrored here, and the calendar month adds up so consistency can beat
 * daily wins. Ranked totals crown the monthly champion on air.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const showId = url.searchParams.get("showId") || "afternoons"
  const requested = url.searchParams.get("month") ?? ""
  const month = monthPattern.test(requested) ? requested : ukMonth()

  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ month, months: [], gameDays: 0, standings: [], status: cloudSaveStatus() })
  }

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response
  const userId = auth.user.id

  try {
    await ensureGameScoreSchema(sql)

    // Extra Mile rule: bonuses pour into the month's total, but the day's win
    // is judged on game points alone… day_top deliberately ignores bonus.
    const standings = await sql`
      WITH daily AS (
        SELECT name_key, display_name, show_date, points, bonus,
               MAX(points) OVER (PARTITION BY show_date) AS day_top
        FROM broadcastos_game_scores
        WHERE user_id = ${userId} AND show_id = ${showId} AND show_date LIKE ${`${month}-%`}
      )
      SELECT
        name_key,
        MIN(display_name) AS display_name,
        SUM(points + bonus)::int AS points,
        SUM(bonus)::int AS bonus_points,
        COUNT(*)::int AS days_played,
        SUM(CASE WHEN points = day_top AND points > 0 THEN 1 ELSE 0 END)::int AS wins,
        MAX(show_date) AS last_played
      FROM daily
      GROUP BY name_key
      ORDER BY points DESC, wins DESC, days_played DESC, name_key ASC
      LIMIT 100
    ` as StandingRow[]

    const dayRows = await sql`
      SELECT COUNT(DISTINCT show_date)::int AS game_days
      FROM broadcastos_game_scores
      WHERE user_id = ${userId} AND show_id = ${showId} AND show_date LIKE ${`${month}-%`}
    ` as { game_days: number }[]

    const monthRows = await sql`
      SELECT DISTINCT LEFT(show_date, 7) AS month
      FROM broadcastos_game_scores
      WHERE user_id = ${userId} AND show_id = ${showId}
      ORDER BY month DESC
      LIMIT 24
    ` as { month: string }[]

    return Response.json({
      month,
      months: monthRows.map((row) => row.month),
      gameDays: dayRows.at(0)?.game_days ?? 0,
      standings: standings.map((row) => ({
        name: row.display_name,
        nameKey: row.name_key,
        points: row.points,
        bonusPoints: row.bonus_points,
        daysPlayed: row.days_played,
        wins: row.wins,
        lastPlayed: row.last_played,
      })),
      status: cloudSaveStatus(),
    })
  } catch (error) {
    return Response.json({ month, months: [], gameDays: 0, standings: [], error: errorMessage(error), status: cloudSaveStatus() })
  }
}

type ScoresPayload = {
  showId?: string
  showDate?: string
  players?: { name?: string; points?: number; bonus?: number }[]
  /** Combine two spellings of the same player into one running total. */
  merge?: { from?: string; to?: string }
}

/**
 * Mirrors one day's scoreboard: the payload replaces everything stored for
 * that show and date, so the last sync of the day IS the final scoreboard.
 */
export async function POST(request: Request) {
  const sql = getCloudSaveSql()
  if (!sql) {
    return Response.json({ error: "Online storage is not available yet.", status: cloudSaveStatus() }, { status: 503 })
  }

  const auth = await requireUser(request)
  if ("response" in auth) return auth.response
  const userId = auth.user.id

  try {
    await ensureGameScoreSchema(sql)

    const body = await request.json().catch(() => null) as ScoresPayload | null
    const showId = typeof body?.showId === "string" && body.showId ? body.showId : "afternoons"

    // Merging two spellings: their day rows combine date by date, then the old
    // spelling disappears… one name, one running total, history intact.
    if (body?.merge) {
      const fromName = typeof body.merge.from === "string" ? body.merge.from.replace(/\s+/g, " ").trim() : ""
      const toName = typeof body.merge.to === "string" ? body.merge.to.replace(/\s+/g, " ").trim() : ""
      if (!fromName || !toName) {
        return Response.json({ error: "Both names are needed for a merge." }, { status: 400 })
      }
      const fromKey = nameKey(fromName)
      const toKey = nameKey(toName)
      if (fromKey === toKey) {
        await sql`
          UPDATE broadcastos_game_scores SET display_name = ${toName}, updated_at = NOW()
          WHERE user_id = ${userId} AND show_id = ${showId} AND name_key = ${toKey}
        `
        return Response.json({ ok: true, merged: true, status: cloudSaveStatus() })
      }
      await sql`
        UPDATE broadcastos_game_scores AS t
        SET points = t.points + f.points, bonus = t.bonus + f.bonus, updated_at = NOW()
        FROM broadcastos_game_scores AS f
        WHERE t.user_id = ${userId} AND t.show_id = ${showId} AND t.name_key = ${toKey}
          AND f.user_id = t.user_id AND f.show_id = t.show_id AND f.show_date = t.show_date
          AND f.name_key = ${fromKey}
      `
      await sql`
        DELETE FROM broadcastos_game_scores AS f
        USING broadcastos_game_scores AS t
        WHERE f.user_id = ${userId} AND f.show_id = ${showId} AND f.name_key = ${fromKey}
          AND t.user_id = f.user_id AND t.show_id = f.show_id AND t.show_date = f.show_date
          AND t.name_key = ${toKey}
      `
      await sql`
        UPDATE broadcastos_game_scores
        SET name_key = ${toKey}, display_name = ${toName}, updated_at = NOW()
        WHERE user_id = ${userId} AND show_id = ${showId} AND name_key = ${fromKey}
      `
      await sql`
        UPDATE broadcastos_game_scores SET display_name = ${toName}, updated_at = NOW()
        WHERE user_id = ${userId} AND show_id = ${showId} AND name_key = ${toKey}
      `
      return Response.json({ ok: true, merged: true, status: cloudSaveStatus() })
    }

    const showDate = typeof body?.showDate === "string" && datePattern.test(body.showDate) ? body.showDate : ""
    if (!showDate) {
      return Response.json({ error: "A show date is needed." }, { status: 400 })
    }

    const players = new Map<string, { name: string; points: number; bonus: number }>()
    for (const player of Array.isArray(body?.players) ? body.players : []) {
      const name = typeof player?.name === "string" ? player.name.replace(/\s+/g, " ").trim() : ""
      if (!name) continue
      const points = Math.max(0, Math.min(99, Math.round(Number(player?.points) || 0)))
      const bonus = Math.max(0, Math.min(99, Math.round(Number(player?.bonus) || 0)))
      const key = nameKey(name)
      const existing = players.get(key)
      players.set(key, {
        name,
        points: Math.max(points, existing?.points ?? 0),
        bonus: Math.max(bonus, existing?.bonus ?? 0),
      })
    }

    await sql`
      DELETE FROM broadcastos_game_scores
      WHERE user_id = ${userId} AND show_id = ${showId} AND show_date = ${showDate}
    `

    for (const [key, player] of players) {
      await sql`
        INSERT INTO broadcastos_game_scores (id, user_id, name_key, display_name, show_id, show_date, points, bonus)
        VALUES (${crypto.randomUUID()}, ${userId}, ${key}, ${player.name}, ${showId}, ${showDate}, ${player.points}, ${player.bonus})
        ON CONFLICT (user_id, name_key, show_id, show_date)
        DO UPDATE SET display_name = ${player.name}, points = ${player.points}, bonus = ${player.bonus}, updated_at = NOW()
      `
    }

    return Response.json({ ok: true, saved: players.size, status: cloudSaveStatus() })
  } catch (error) {
    return Response.json({ error: errorMessage(error), status: cloudSaveStatus() }, { status: 500 })
  }
}
