"use client"

import Link from "next/link"
import { useState } from "react"
import { Check, ChevronDown, HandHeart, HeartHandshake, MessageCircleHeart } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { usePastoralCare } from "@/lib/listener-log"
import { cn } from "@/lib/utils"

function formatDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

/**
 * Pastoral care: the family members who've gone quiet and the prayer requests
 * awaiting a personal follow-up. Care beyond the radio.
 */
export function PastoralCarePanel({ compact = false }: { compact?: boolean }) {
  const care = usePastoralCare()
  const [showHistory, setShowHistory] = useState(false)
  const miaShown = compact ? care.mia.slice(0, 4) : care.mia
  const prayersShown = compact ? care.prayerFollowUps.slice(0, 3) : care.prayerFollowUps
  const nothingWaiting = !care.loading && care.mia.length === 0 && care.prayerFollowUps.length === 0

  if (compact && nothingWaiting) return null

  return (
    <Card className="rounded-[26px] border-fuchsia-200/60 bg-gradient-to-br from-white to-fuchsia-50/40 py-0 shadow-card">
      <CardContent className={cn("p-5", !compact && "sm:p-7")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-fuchsia-600 text-white"><HeartHandshake className="size-5" /></span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fuchsia-700">Pastoral care</p>
              <h2 className={cn("font-semibold tracking-[-0.03em]", compact ? "text-lg" : "text-2xl")}>The family beyond the radio</h2>
            </div>
          </div>
          {(care.mia.length > 0 || care.prayerFollowUps.length > 0) && (
            <Badge className="bg-fuchsia-100 text-fuchsia-800">
              {care.mia.length + care.prayerFollowUps.length} waiting on you
            </Badge>
          )}
        </div>

        {nothingWaiting && (
          <p className="mt-4 rounded-2xl border border-dashed border-fuchsia-200 p-4 text-center text-sm text-muted-foreground">
            Everyone's accounted for and every prayer request has been followed up. The family is loved.
          </p>
        )}

        {care.mia.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Missing in action · quiet for over a week
            </p>
            <div className="mt-2 space-y-2">
              {miaShown.map((listener) => (
                <div key={listener.nameKey} className="flex items-center gap-3 rounded-2xl border bg-white p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{listener.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Quiet for {listener.daysQuiet} days · last heard {formatDate(listener.lastHeard)} · {listener.totalMessages} message{listener.totalMessages === 1 ? "" : "s"} all time
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void care.checkIn(listener.name)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-fuchsia-200 bg-fuchsia-50 px-3 text-xs font-semibold text-fuchsia-800 transition-colors hover:bg-fuchsia-600 hover:text-white"
                  >
                    <MessageCircleHeart className="size-3.5" />
                    I&apos;ve checked in
                  </button>
                </div>
              ))}
              {compact && care.mia.length > miaShown.length && (
                <p className="px-1 text-xs text-muted-foreground">+ {care.mia.length - miaShown.length} more in Insights</p>
              )}
            </div>
          </div>
        )}

        {care.prayerFollowUps.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Prayer requests · follow up personally
            </p>
            <div className="mt-2 space-y-2">
              {prayersShown.map((note) => (
                <div key={note.id} className="flex items-start gap-3 rounded-2xl border bg-white p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700"><HandHeart className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{care.nameFor(note.nameKey)}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{note.content}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{note.showDate ? `From the show on ${formatDate(note.showDate)}` : formatDate(note.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void care.markFollowedUp(note.id)}
                    className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-800 transition-colors hover:bg-violet-600 hover:text-white"
                  >
                    <Check className="size-3.5" />
                    Followed up
                  </button>
                </div>
              ))}
              {compact && care.prayerFollowUps.length > prayersShown.length && (
                <p className="px-1 text-xs text-muted-foreground">+ {care.prayerFollowUps.length - prayersShown.length} more in Insights</p>
              )}
            </div>
          </div>
        )}

        {!compact && care.followedUpPrayers.length > 0 && (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowHistory((open) => !open)}
              className="flex w-full items-center justify-between rounded-xl bg-white/60 px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-white"
              aria-expanded={showHistory}
            >
              <span>Cared for · {care.followedUpPrayers.length} followed-up prayer request{care.followedUpPrayers.length === 1 ? "" : "s"}</span>
              <ChevronDown className={cn("size-4 transition-transform", showHistory && "rotate-180")} />
            </button>
            {showHistory && (
              <div className="mt-2 space-y-2">
                {care.followedUpPrayers.map((note) => (
                  <div key={note.id} className="flex items-start gap-3 rounded-2xl border bg-white/70 p-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><Check className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{care.nameFor(note.nameKey)}</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{note.content}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {note.showDate ? `From the show on ${formatDate(note.showDate)} · ` : ""}Followed up {formatDate(note.followedUpAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {compact && (care.mia.length > 0 || care.prayerFollowUps.length > 0) && (
          <p className="mt-4 text-right">
            <Link href="/insights" className="text-xs font-semibold text-fuchsia-700 hover:underline">Open the full care list</Link>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
