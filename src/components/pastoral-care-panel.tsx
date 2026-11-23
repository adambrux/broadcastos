"use client"

import Link from "next/link"
import { useState } from "react"
import { Check, ChevronDown, Copy, HandHeart, HeartHandshake, Loader2, MessageCircleHeart, PenLine } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { usePastoralCare } from "@/lib/listener-log"
import { cn } from "@/lib/utils"

function formatDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

type CheckinDraft = { text: string; variant: string; show: string; busy: boolean; notice: string }

/**
 * Pastoral care: the family members who've gone quiet and the prayer requests
 * awaiting a personal follow-up. Care beyond the radio. Since v2.41 each quiet
 * name gets a written check-in, in wording that person has never had before.
 */
export function PastoralCarePanel({ compact = false }: { compact?: boolean }) {
  const care = usePastoralCare()
  const [showHistory, setShowHistory] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, CheckinDraft>>({})

  async function writeCheckin(name: string, key: string) {
    setDrafts((current) => ({ ...current, [key]: { text: "", variant: "", show: "", busy: true, notice: "" } }))
    try {
      const response = await fetch(`/api/checkins?name=${encodeURIComponent(name)}`, { cache: "no-store" })
      const data = (await response.json().catch(() => null)) as { text?: string; variant?: string; show?: string; error?: string } | null
      if (!response.ok || !data?.text) throw new Error(data?.error ?? "Could not write the check-in.")
      setDrafts((current) => ({ ...current, [key]: { text: data.text!, variant: data.variant ?? "", show: data.show ?? "", busy: false, notice: "" } }))
    } catch (error) {
      setDrafts((current) => ({ ...current, [key]: { text: "", variant: "", show: "", busy: false, notice: error instanceof Error ? error.message : "Could not write the check-in." } }))
    }
  }

  async function copyAndSend(name: string, key: string) {
    const draft = drafts[key]
    if (!draft?.text.trim()) return
    let copied = true
    try {
      await navigator.clipboard.writeText(draft.text.trim())
    } catch {
      copied = false
    }
    try {
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text: draft.text.trim(), variant: draft.variant || "edited", show: draft.show }),
      })
      if (!response.ok) throw new Error("The check-in was not recorded.")
      await care.checkIn(name)
      setDrafts((current) => { const next = { ...current }; delete next[key]; return next })
    } catch (error) {
      setDrafts((current) => ({ ...current, [key]: { ...draft, notice: error instanceof Error ? error.message : "Not recorded." } }))
      return
    }
    if (!copied) window.alert("Marked as sent, but the text could not be copied on this device. Copy it by hand.")
  }
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

        {!compact && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3 text-xs text-muted-foreground">
            <span>
              {care.floor ? `The missing list has counted since ${formatDate(care.floor)}. A week of silence after that puts someone here.` : "A week of silence puts someone here."}
            </span>
            <button
              type="button"
              onClick={() => { if (window.confirm("Start the missing list again from today? Nobody will show as missing until a week from now.")) void care.resetMissingList() }}
              className="rounded-lg border px-3 py-1.5 font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Reset the missing list
            </button>
          </div>
        )}

        {care.mia.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Missing in action · quiet for over a week
            </p>
            <div className="mt-2 space-y-2">
              {miaShown.map((listener) => {
                const draft = drafts[listener.nameKey]
                return (
                  <div key={listener.nameKey} className="rounded-2xl border bg-white p-3">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{listener.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Quiet for {listener.daysQuiet} days · last heard {formatDate(listener.lastHeard)} · {listener.totalMessages} message{listener.totalMessages === 1 ? "" : "s"} all time
                        </p>
                      </div>
                      {!draft && (
                        <button
                          type="button"
                          onClick={() => void writeCheckin(listener.name, listener.nameKey)}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-fuchsia-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-fuchsia-700"
                        >
                          <PenLine className="size-3.5" />
                          Write the check-in
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void care.checkIn(listener.name)}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-fuchsia-200 bg-fuchsia-50 px-3 text-xs font-semibold text-fuchsia-800 transition-colors hover:bg-fuchsia-600 hover:text-white"
                        title="Already messaged them another way"
                      >
                        <MessageCircleHeart className="size-3.5" />
                        I&apos;ve checked in
                      </button>
                    </div>
                    {draft && (
                      <div className="mt-3 space-y-2">
                        {draft.busy ? (
                          <p className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" />Writing one they haven&apos;t had before…</p>
                        ) : (
                          <>
                            <textarea
                              rows={3}
                              value={draft.text}
                              onChange={(event) => setDrafts((current) => ({ ...current, [listener.nameKey]: { ...draft, text: event.target.value } }))}
                              className="w-full rounded-xl border border-input bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-ring"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void copyAndSend(listener.name, listener.nameKey)}
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-ink px-3 text-xs font-semibold text-white transition-colors hover:bg-ink/90"
                              >
                                <Copy className="size-3.5" />
                                Copy and mark sent
                              </button>
                              <button
                                type="button"
                                onClick={() => void writeCheckin(listener.name, listener.nameKey)}
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                              >
                                Another one
                              </button>
                              {draft.show && <span className="text-[11px] text-muted-foreground">Signed from {draft.show}</span>}
                            </div>
                          </>
                        )}
                        {draft.notice && <p className="text-xs text-red-700">{draft.notice}</p>}
                      </div>
                    )}
                  </div>
                )
              })}
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
