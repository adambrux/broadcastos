"use client"

import { useEffect, useState } from "react"

export type ArcadeStanding = {
  name: string
  nameKey: string
  points: number
  daysPlayed: number
  wins: number
  lastPlayed: string
}

export type ArcadeMonthData = {
  month: string
  months: string[]
  gameDays: number
  standings: ArcadeStanding[]
}

/** The Arcade leaderboard belongs to Afternoons with Adam. */
export const arcadeShowId = "afternoons"

export function ukMonth() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" }).slice(0, 7)
}

export function arcadeMonthLabel(month: string) {
  const date = new Date(`${month}-01T12:00:00`)
  if (Number.isNaN(date.getTime())) return month
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

/** Push one day's scoreboard to the cloud so the monthly totals stay live. */
export async function syncArcadeScores(showDate: string, players: { name: string; points: number }[]) {
  await fetch("/api/game-scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ showId: arcadeShowId, showDate, players }),
  })
}

/** The month's master leaderboard, refetched whenever refreshToken changes. */
export function useArcadeMonth(month: string, enabled = true, refreshToken = 0) {
  const [data, setData] = useState<ArcadeMonthData | null>(null)
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled || !month) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(`/api/game-scores?showId=${encodeURIComponent(arcadeShowId)}&month=${encodeURIComponent(month)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<ArcadeMonthData> : null)
      .then((payload) => {
        if (!cancelled && payload && Array.isArray(payload.standings)) setData(payload)
      })
      .catch(() => {
        // Offline is fine: the daily scoreboard keeps working locally.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [month, enabled, refreshToken])

  return { data, loading }
}
