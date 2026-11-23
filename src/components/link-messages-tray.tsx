"use client"

import { useEffect, useState } from "react"
import { Check, ChevronDown, Inbox, MessageCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BankMessageForm } from "@/components/listener-messages"
import type { AddInput, AddResult } from "@/lib/listener-messages"
import type { ListenerMessage } from "@/lib/listener-messages-shared"
import type { ParkedNote } from "@/lib/parked-notes-shared"
import { estimateSeconds, formatClock, formatSpoken, readingPace } from "@/lib/read-time"
import { cn } from "@/lib/utils"

/**
 * THE TRAY (v2.46). When a link asks "do you have responses?" and the answer
 * is yes, this is where the messages are: every banked read not yet used and
 * every Pocket note for later today. Tap the ones to read, in order, or take
 * the newest one, two or three. Picked reads land in the script under the
 * Moment with their reading time, and the link's estimate counts them.
 */

export type Pickable =
  | { kind: "message"; id: string; key: string; name: string; text: string; seconds: number; when: string; source: string }
  | { kind: "pocket"; id: string; key: string; name: string; text: string; seconds: number; when: string; source: string }

export function pickablesFrom(messages: ListenerMessage[], notes: ParkedNote[], pace: number): Pickable[] {
  const reads: Pickable[] = messages
    .filter((message) => !message.usedAt && message.readStatus === "ready" && message.readVersion)
    .map((message) => ({
      kind: "message",
      id: message.id,
      key: `m:${message.id}`,
      name: message.name,
      text: message.readVersion ?? "",
      seconds: estimateSeconds(message.readVersion ?? "", pace),
      when: message.createdAt,
      source: message.source,
    }))
  const pocket: Pickable[] = notes
    .filter((note) => !note.usedAt && note.when === "later-today")
    .map((note) => ({
      kind: "pocket",
      id: note.id,
      key: `p:${note.id}`,
      name: note.sender || "Pocket",
      text: note.text,
      seconds: 0,
      when: note.createdAt,
      source: note.source,
    }))
  return [...reads, ...pocket].sort((a, b) => b.when.localeCompare(a.when))
}

function timeLabel(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })
  } catch {
    return ""
  }
}

type TrayProps = {
  showId: string
  showDate: string
  items: Pickable[]
  picks: string[]
  onPicksChange: (keys: string[]) => void
  add: (input: AddInput) => Promise<AddResult>
  aiOff?: boolean
  open: boolean
  onToggle: () => void
}

export function LinkMessagesTray({ showId, showDate, items, picks, onPicksChange, add, aiOff = false, open, onToggle }: TrayProps) {
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pace, setPace] = useState(150)
  useEffect(() => { setPace(readingPace()) }, [])

  const picked = picks.map((key) => items.find((item) => item.key === key)).filter((item): item is Pickable => Boolean(item))
  const totalSeconds = picked.reduce((sum, item) => sum + item.seconds, 0)
  const reads = items.filter((item) => item.kind === "message")

  function toggle(key: string) {
    onPicksChange(picks.includes(key) ? picks.filter((item) => item !== key) : [...picks, key])
  }

  function quick(count: number) {
    onPicksChange(reads.slice(0, count).map((item) => item.key))
  }

  return (
    <section className="rounded-[24px] border border-emerald-300/30 bg-emerald-400/[0.08] p-4 sm:p-5">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={open}>
        <span className="flex flex-wrap items-center gap-2">
          <MessageCircle className="size-4 text-emerald-200" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100">Messages for this link</span>
          <Badge className="bg-white/10 text-white">{items.length} ready</Badge>
          {picked.length > 0 && <Badge className="bg-emerald-300 text-ink">{picked.length} picked · {formatClock(totalSeconds)}</Badge>}
        </span>
        <ChevronDown className={cn("size-4 text-white/50 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-white/55">Read the newest</span>
            {[1, 2, 3].map((count) => (
              <Button key={count} size="sm" variant="outline" className="h-8 rounded-lg border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" disabled={reads.length < count} onClick={() => quick(count)}>
                {count}
              </Button>
            ))}
            {picks.length > 0 && (
              <Button size="sm" variant="ghost" className="h-8 rounded-lg text-white/60 hover:bg-white/10 hover:text-white" onClick={() => onPicksChange([])}>Clear</Button>
            )}
            <span className="ml-auto text-[11px] text-white/45">
              {picked.length ? `${picked.length} to read, ${formatSpoken(totalSeconds)}` : "Nothing picked yet"}
            </span>
          </div>

          {items.length ? (
            <ul className="space-y-2">
              {items.map((item) => {
                const index = picks.indexOf(item.key)
                const on = index >= 0
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => toggle(item.key)}
                      aria-pressed={on}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors",
                        on ? "border-emerald-300/60 bg-emerald-300/15" : "border-white/10 bg-black/20 hover:bg-white/5"
                      )}
                    >
                      <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold", on ? "bg-emerald-300 text-ink" : "bg-white/10 text-white/50")}>
                        {on ? index + 1 : <Check className="size-3.5 opacity-30" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white">{item.name}</span>
                          {item.kind === "pocket" ? (
                            <Badge className="bg-amber-300/20 text-[9px] text-amber-100"><Inbox />Pocket</Badge>
                          ) : (
                            <span className="text-[11px] text-white/45">{formatSpoken(item.seconds)}</span>
                          )}
                          <span className="text-[11px] text-white/35">{timeLabel(item.when)}</span>
                        </span>
                        <span className="mt-1 block whitespace-pre-line text-sm leading-5 text-white/80">{item.text}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 p-3 text-xs leading-5 text-white/40">
              Nothing ready to read. Paste one below and the read comes back in a few seconds.
            </p>
          )}

          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <button type="button" onClick={() => setPasteOpen((value) => !value)} className="flex w-full items-center justify-between text-left" aria-expanded={pasteOpen}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">Paste one now</span>
              <ChevronDown className={cn("size-4 text-white/40 transition-transform", pasteOpen && "rotate-180")} />
            </button>
            {pasteOpen && (
              <div className="mt-3">
                <BankMessageForm showId={showId} showDate={showDate} dark compact add={add} aiOff={aiOff} />
              </div>
            )}
          </div>
        </div>
      )}
      <p className="sr-only">Reading pace {pace} words a minute</p>
    </section>
  )
}
