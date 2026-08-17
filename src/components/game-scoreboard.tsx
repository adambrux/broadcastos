"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Crown, Minus, Plus, RotateCcw, Star, Trophy, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { arcadeMonthLabel, arcadeShowId, syncArcadeScores, useArcadeMonth } from "@/lib/arcade-leaderboard"
import { cn } from "@/lib/utils"
import { arcadeAllowed } from "@/lib/user-scope"
import { scopedKey } from "@/lib/user-scope"

type Mark = "" | "y" | "n"

type Player = {
  name: string
  marks: Mark[]
  /** Extra Mile stars: count in the monthly totals, never in today's win. */
  bonus?: number
}

type ScoreboardState = {
  questions: number
  players: Player[]
}

function storageKey(showId: string, showDate: string) {
  return scopedKey(`broadcastos-scoreboard:${showId}:${showDate || "undated"}`)
}

function readState(showId: string, showDate: string): ScoreboardState {
  try {
    const raw = window.localStorage.getItem(storageKey(showId, showDate))
    if (raw) return JSON.parse(raw) as ScoreboardState
  } catch { /* fall through */ }
  return { questions: 7, players: [] }
}

function score(player: Player) {
  return player.marks.filter((mark) => mark === "y").length
}

function bonusOf(player: Player) {
  return Math.max(0, Math.min(9, Math.round(player.bonus ?? 0)))
}

/**
 * Live game scoreboard for the Arcade hour: tick or cross each player per
 * question as answers arrive, and the ranking sorts itself… no counting
 * through the WhatsApp scroll at the end of the hour.
 */
function GameScoreboardInner({
  showId,
  showDate,
  suggest,
}: {
  showId: string
  showDate: string
  suggest: (query: string) => string[]
}) {
  const [state, setState] = useState<ScoreboardState>({ questions: 7, players: [] })
  const [open, setOpen] = useState(true)
  const [nameInput, setNameInput] = useState("")
  const [monthRefresh, setMonthRefresh] = useState(0)
  const syncTimer = useRef<number | null>(null)
  const isArcadeShow = showId === arcadeShowId
  const month = showDate.slice(0, 7)
  const monthly = useArcadeMonth(month, isArcadeShow, monthRefresh)

  useEffect(() => {
    const stored = readState(showId, showDate)
    setState(stored)
    if (stored.players.length > 0) setOpen(true)
  }, [showId, showDate])

  useEffect(() => () => {
    if (syncTimer.current !== null) window.clearTimeout(syncTimer.current)
  }, [])

  function save(next: ScoreboardState) {
    setState(next)
    window.localStorage.setItem(storageKey(showId, showDate), JSON.stringify(next))
    // Mirror the day's board online (Afternoons only) so the monthly
    // leaderboard is always the latest count without a separate save step.
    if (!isArcadeShow) return
    if (syncTimer.current !== null) window.clearTimeout(syncTimer.current)
    syncTimer.current = window.setTimeout(() => {
      syncTimer.current = null
      syncArcadeScores(showDate, next.players.map((player) => ({ name: player.name, points: score(player), bonus: bonusOf(player) })))
        .then(() => setMonthRefresh((value) => value + 1))
        .catch(() => {})
    }, 1200)
  }

  function setQuestions(count: number) {
    const questions = Math.min(12, Math.max(1, count))
    save({
      questions,
      players: state.players.map((player) => ({
        ...player,
        marks: Array.from({ length: questions }, (_, index) => player.marks[index] ?? ""),
      })),
    })
  }

  function addPlayer(rawName: string) {
    const name = rawName.replace(/\s+/g, " ").trim()
    if (!name) return
    if (state.players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
      setNameInput("")
      return
    }
    save({ ...state, players: [...state.players, { name, marks: Array.from({ length: state.questions }, () => "" as Mark) }] })
    setNameInput("")
  }

  function cycleMark(playerName: string, questionIndex: number) {
    save({
      ...state,
      players: state.players.map((player) => {
        if (player.name !== playerName) return player
        const marks = [...player.marks]
        marks[questionIndex] = marks[questionIndex] === "" ? "y" : marks[questionIndex] === "y" ? "n" : ""
        return { ...player, marks }
      }),
    })
  }

  function removePlayer(playerName: string) {
    save({ ...state, players: state.players.filter((player) => player.name !== playerName) })
  }

  // Extra Mile stars: tap the star to give one, tap the amber count to take
  // one back. They ride to the monthly board but never touch today's ranking.
  function giveStar(playerName: string) {
    save({ ...state, players: state.players.map((player) => player.name === playerName ? { ...player, bonus: Math.min(9, bonusOf(player) + 1) } : player) })
  }

  function takeStar(playerName: string) {
    save({ ...state, players: state.players.map((player) => player.name === playerName ? { ...player, bonus: Math.max(0, bonusOf(player) - 1) } : player) })
  }

  function reset() {
    if (!window.confirm("Clear the whole scoreboard for this show?")) return
    save({ questions: state.questions, players: [] })
  }

  // Suggestions pull from the listener log AND the monthly board, so a
  // returning player always matches their existing name… one spelling, one
  // running total, no accidental twins like a lost letter creating a new player.
  function suggestPlayers(query: string) {
    const q = query.replace(/\s+/g, " ").trim().toLowerCase()
    if (!q) return []
    const pool = [...suggest(query), ...(monthly.data?.standings ?? []).map((standing) => standing.name)]
    const merged: string[] = []
    for (const name of pool) {
      if (!name.toLowerCase().includes(q)) continue
      if (merged.some((seen) => seen.toLowerCase() === name.toLowerCase())) continue
      if (state.players.some((player) => player.name.toLowerCase() === name.toLowerCase())) continue
      merged.push(name)
      if (merged.length >= 6) break
    }
    return merged
  }

  const ranked = [...state.players].sort((a, b) => score(b) - score(a))
  const topScore = ranked.length ? score(ranked[0]) : 0
  const winners = ranked.filter((player) => score(player) === topScore && topScore > 0)

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-300" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Game scoreboard</span>
        </span>
        <span className="flex items-center gap-2">
          {state.players.length > 0 && <Badge className="bg-white/10 text-white">{state.players.length} playing</Badge>}
          <ChevronDown className={cn("size-4 text-white/40 transition-transform", open && "rotate-180")} />
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-1">
              <button type="button" onClick={() => setQuestions(state.questions - 1)} aria-label="Fewer questions" className="grid size-8 place-items-center rounded-lg text-white/45 hover:bg-white/10 hover:text-white"><Minus className="size-3.5" /></button>
              <span className="text-xs font-semibold text-white/70">{state.questions} question{state.questions === 1 ? "" : "s"}</span>
              <button type="button" onClick={() => setQuestions(state.questions + 1)} aria-label="More questions" className="grid size-8 place-items-center rounded-lg text-white/45 hover:bg-white/10 hover:text-white"><Plus className="size-3.5" /></button>
            </div>
            {state.players.length > 0 && (
              <button type="button" onClick={reset} className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-semibold text-white/35 hover:bg-white/10 hover:text-white">
                <RotateCcw className="size-3" />Clear
              </button>
            )}
          </div>

          <div className="relative">
            <div className="flex gap-2">
              <Input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") addPlayer(nameInput) }}
                placeholder="Add a player…"
                className="h-10 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/25"
              />
              <Button className="h-10 rounded-xl bg-white px-3 text-ink hover:bg-white/90" onClick={() => addPlayer(nameInput)} aria-label="Add player">
                <Plus className="size-4" />
              </Button>
            </div>
            {suggestPlayers(nameInput).length > 0 && (
              <div className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-white/15 bg-[#14151d] shadow-2xl">
                {suggestPlayers(nameInput).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => addPlayer(name)}
                    className="flex min-h-10 w-full items-center px-3 text-left text-sm font-semibold transition-colors hover:bg-white/10"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {ranked.length > 0 ? (
            <div className="space-y-1.5">
              {ranked.map((player, index) => (
                <div key={player.name} className={cn(
                  "rounded-xl border border-white/10 bg-black/20 p-2",
                  winners.some((winner) => winner.name === player.name) && "border-amber-300/40 bg-amber-300/[0.07]"
                )}>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-md font-mono text-[10px] font-bold",
                      index === 0 && score(player) > 0 ? "bg-amber-300 text-ink" : "bg-white/10 text-white/60"
                    )}>{index + 1}</span>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold">{player.name}</p>
                    {bonusOf(player) > 0 && (
                      <button type="button" onClick={() => takeStar(player.name)} aria-label={`Take one Extra Mile star from ${player.name}`} className="rounded-md bg-amber-300/15 px-1.5 py-1 font-mono text-[10px] font-bold text-amber-200 hover:bg-amber-300/25">
                        +{bonusOf(player)}★
                      </button>
                    )}
                    <button type="button" onClick={() => giveStar(player.name)} aria-label={`Give ${player.name} an Extra Mile star`} className="grid size-7 place-items-center rounded-md text-amber-300/50 hover:bg-amber-300/15 hover:text-amber-200">
                      <Star className="size-3.5" />
                    </button>
                    <Badge className="bg-white/10 font-mono text-white">{score(player)}/{state.questions}</Badge>
                    <button type="button" onClick={() => removePlayer(player.name)} aria-label={`Remove ${player.name}`} className="grid size-7 place-items-center rounded-md text-white/25 hover:bg-white/10 hover:text-white">
                      <X className="size-3" />
                    </button>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {player.marks.map((mark, questionIndex) => (
                      <button
                        key={questionIndex}
                        type="button"
                        onClick={() => cycleMark(player.name, questionIndex)}
                        aria-label={`${player.name}, question ${questionIndex + 1}: ${mark === "y" ? "correct" : mark === "n" ? "wrong" : "not answered"}`}
                        className={cn(
                          "grid h-8 min-w-8 place-items-center rounded-md text-[10px] font-bold transition-colors",
                          mark === "y" && "bg-emerald-400/80 text-ink",
                          mark === "n" && "bg-red-500/50 text-white",
                          mark === "" && "bg-white/[0.07] text-white/40 hover:bg-white/15"
                        )}
                      >
                        {mark === "y" ? "✓" : mark === "n" ? "✗" : `Q${questionIndex + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {winners.length > 0 && (
                <p className="rounded-xl bg-amber-300/10 px-3 py-2 text-center text-xs font-semibold text-amber-200">
                  {winners.length === 1
                    ? `${winners[0].name} leads with ${topScore}/${state.questions}`
                    : `${winners.map((winner) => winner.name).join(" and ")} tied on ${topScore}/${state.questions}`}
                </p>
              )}
              {state.players.some((player) => bonusOf(player) > 0) && (
                <p className="text-center text-[10px] leading-4 text-white/30">
                  ★ Extra Mile stars ride to the monthly board… they never decide today's win.
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs leading-5 text-white/35">
              Add players as answers arrive, tap each question box to mark right or wrong… the ranking sorts itself.
            </p>
          )}

          {isArcadeShow && (monthly.data?.standings.length ?? 0) > 0 && (
            <div className="rounded-xl border border-amber-300/15 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200/80">
                  <Crown className="size-3.5" />{arcadeMonthLabel(monthly.data!.month)} so far
                </p>
                <span className="text-[10px] text-white/35">
                  {monthly.data!.gameDays} game day{monthly.data!.gameDays === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {monthly.data!.standings.slice(0, 5).map((standing, index) => (
                  <div
                    key={standing.nameKey}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5",
                      index === 0 ? "bg-amber-300/[0.12]" : "bg-white/[0.04]"
                    )}
                  >
                    <span className={cn(
                      "grid size-5 shrink-0 place-items-center rounded font-mono text-[10px] font-bold",
                      index === 0 ? "bg-amber-300 text-ink" : "bg-white/10 text-white/55"
                    )}>{index + 1}</span>
                    <p className="min-w-0 flex-1 truncate text-xs font-semibold">{standing.name}</p>
                    <span className="text-[10px] text-white/35">{standing.daysPlayed} day{standing.daysPlayed === 1 ? "" : "s"}</span>
                    {(standing.bonusPoints ?? 0) > 0 && (
                      <span className="font-mono text-[10px] font-bold text-amber-200/60">+{standing.bonusPoints}★</span>
                    )}
                    <span className="font-mono text-xs font-bold text-amber-200">{standing.points} pts</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] leading-4 text-white/30">
                Month totals across every game day… the full table lives in Insights.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


// Presenters without the Arcade never see the scoreboard. Mount-gated so the
// server render stays stable.
export function GameScoreboard(props: Parameters<typeof GameScoreboardInner>[0]) {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready || !arcadeAllowed()) return null
  return <GameScoreboardInner {...props} />
}
