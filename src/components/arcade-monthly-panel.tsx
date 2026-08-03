"use client"

import { arcadeAllowed } from "@/lib/user-scope"
import { useState, useEffect } from "react"
import { Crown, Gamepad2, Loader2, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { arcadeMonthLabel, ukMonth, useArcadeMonth } from "@/lib/arcade-leaderboard"
import { cn } from "@/lib/utils"

/**
 * The Arcade's monthly master leaderboard for Afternoons with Adam: every
 * day's final scoreboard adds up across the calendar month, so showing up
 * every day can beat a couple of big wins. The ranked final count is what
 * crowns the monthly champion on air on the last show of the month.
 */
function ArcadeMonthlyPanelInner() {
  const [month, setMonth] = useState(ukMonth())
  const { data, loading } = useArcadeMonth(month)

  const months = data?.months?.length ? data.months : []
  const monthOptions = months.includes(month) ? months : [month, ...months]
  const standings = data?.standings ?? []
  const champion = standings.length > 0 && standings[0].points > 0 ? standings[0] : null

  return (
    <Card className="rounded-[28px] border-amber-200/70 bg-gradient-to-br from-white to-amber-50/50 py-0 shadow-card">
      <CardContent className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-amber-400 text-ink"><Gamepad2 className="size-5" /></span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">Afternoon Arcade · monthly leaderboard</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{arcadeMonthLabel(month)} final count</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Every game day's scoreboard adds up here… consistency can beat daily wins. The top name takes the monthly crown on the last show of the month.
              </p>
            </div>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Month</span>
            <select
              className="min-h-10 rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-200/40"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            >
              {monthOptions.map((option) => (
                <option key={option} value={option}>{arcadeMonthLabel(option)}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="mt-5 grid min-h-28 place-items-center rounded-2xl border border-dashed border-amber-200 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Adding up the month…</span>
          </div>
        ) : standings.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-amber-200 py-10 text-center text-sm text-muted-foreground">
            <Trophy className="mx-auto mb-3 size-6 text-amber-500" />
            No games played this month yet. Run the Arcade On Air and every day's scoreboard lands here automatically.
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {champion && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-100/60 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-400 text-ink"><Crown className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">Leading the month</p>
                  <p className="truncate text-lg font-semibold">{champion.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-black">{champion.points} pts</p>
                  <p className="text-[10px] text-muted-foreground">{champion.daysPlayed} game day{champion.daysPlayed === 1 ? "" : "s"} played</p>
                </div>
              </div>
            )}
            {standings.map((standing, index) => (
              <div key={standing.nameKey} className="flex items-center gap-3 rounded-2xl border bg-white p-3.5">
                <span className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold",
                  index === 0 ? "bg-amber-400 text-ink" : index < 3 ? "bg-ink text-white" : "bg-muted text-muted-foreground"
                )}>{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{standing.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Played {standing.daysPlayed} day{standing.daysPlayed === 1 ? "" : "s"}
                    {standing.wins > 0 ? ` · won the day ${standing.wins} time${standing.wins === 1 ? "" : "s"}` : ""}
                  </p>
                </div>
                <Badge className="bg-amber-100 font-mono text-amber-900">{standing.points} pts</Badge>
              </div>
            ))}
            <p className="px-1 text-[11px] text-muted-foreground">
              {data?.gameDays ?? 0} game day{(data?.gameDays ?? 0) === 1 ? "" : "s"} counted so far in {arcadeMonthLabel(month)}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


export function ArcadeMonthlyPanel() {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready || !arcadeAllowed()) return null
  return <ArcadeMonthlyPanelInner />
}
