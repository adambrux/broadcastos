"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowLeft, Check, Mic2, Moon, Plus, RotateCcw, Sun, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { scopedKey } from "@/lib/user-scope"
import {
  addEpisode,
  loadLibrary,
  parsePodcastNotes,
  questionCount,
  removeEpisode,
  updateEpisodeCovered,
  type PodcastCard,
  type PodcastEpisode,
} from "@/lib/podcast-notes"
import { cn } from "@/lib/utils"

function coveredCount(episode: PodcastEpisode) {
  return episode.doc.sections.reduce(
    (sum, section) => sum + section.cards.filter((card) => card.kind === "question" && episode.covered[card.id]).length,
    0
  )
}

function savedDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
  } catch {
    return ""
  }
}

function SpokenBlock({ label, lines, dark, hint }: { label: string; lines: string[]; dark: boolean; hint?: string }) {
  if (!lines.length) return null
  return (
    <section className={cn("rounded-2xl border p-6 shadow-sm", dark ? "border-zinc-800 bg-zinc-950" : "border-border bg-card")}>
      <p className={cn("text-[11px] font-semibold uppercase tracking-wide", dark ? "text-indigo-300" : "text-brand-indigo")}>{label}</p>
      <div className="mt-3 space-y-2">
        {lines.map((line, index) => (
          <p key={index} className={cn("text-lg leading-relaxed tracking-[-0.01em]", dark && "text-white")}>
            {line}
          </p>
        ))}
      </div>
      {hint ? <p className={cn("mt-4 text-xs", dark ? "text-zinc-500" : "text-muted-foreground")}>{hint}</p> : null}
    </section>
  )
}

function CardView({
  card,
  covered,
  dark,
  onToggle,
  registerRef,
}: {
  card: PodcastCard
  covered: boolean
  dark: boolean
  onToggle: () => void
  registerRef: (id: string, el: HTMLDivElement | null) => void
}) {
  if (card.kind === "transition") {
    return (
      <div className="relative pl-6">
        <div className={cn("absolute left-2 top-0 h-full w-px", dark ? "bg-indigo-400/40" : "bg-brand-indigo/30")} aria-hidden />
        <p className={cn("rounded-xl px-4 py-3 text-[15px] italic leading-relaxed", dark ? "bg-indigo-950/60 text-indigo-200" : "bg-brand-soft/60 text-brand-indigo")}>
          {card.text}
        </p>
      </div>
    )
  }

  if (card.kind === "you") {
    return (
      <div className={cn("rounded-xl border px-4 py-3", dark ? "border-amber-500/30 bg-amber-950/40" : "border-amber-200 bg-amber-50")}>
        <p className={cn("text-[11px] font-semibold uppercase tracking-wide", dark ? "text-amber-400" : "text-amber-700")}>You at the table</p>
        <p className={cn("mt-1 text-[15px] leading-relaxed", dark ? "text-amber-100" : "text-amber-900")}>{card.text}</p>
      </div>
    )
  }

  if (card.kind === "note") {
    return <p className={cn("px-1 text-sm leading-relaxed", dark ? "text-zinc-400" : "text-muted-foreground")}>{card.text}</p>
  }

  return (
    <div
      ref={(el) => registerRef(card.id, el)}
      role="button"
      tabIndex={0}
      aria-pressed={covered}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onToggle()
        }
      }}
      className={cn(
        "cursor-pointer rounded-2xl border p-5 shadow-sm transition-all",
        dark ? "bg-zinc-950" : "bg-card",
        covered
          ? dark
            ? "border-zinc-800/70 opacity-40"
            : "border-border/50 opacity-45"
          : dark
            ? "border-zinc-800 hover:border-indigo-400/50"
            : "border-border hover:border-brand-indigo/40 hover:shadow-[var(--shadow-lift)]"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
            covered ? "border-emerald-500 bg-emerald-500 text-white" : dark ? "border-zinc-700 text-transparent" : "border-border text-transparent"
          )}
          aria-hidden
        >
          <Check className="size-3.5" />
        </span>
        <p className={cn("text-lg leading-relaxed tracking-[-0.01em]", dark && "text-white", covered && "line-through decoration-1")}>{card.text}</p>
      </div>
    </div>
  )
}

export function PodcastModePage() {
  const [library, setLibrary] = useState<PodcastEpisode[] | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const [recordMode, setRecordMode] = useState(false)
  const cardRefs = useRef(new Map<string, HTMLDivElement | null>())

  useEffect(() => {
    setLibrary(loadLibrary())
    try {
      setRecordMode(window.localStorage.getItem(scopedKey("broadcastos-podcast-record-mode")) === "on")
    } catch {
      // Ignore.
    }
  }, [])

  const toggleRecordMode = () => {
    setRecordMode((value) => {
      const next = !value
      try {
        window.localStorage.setItem(scopedKey("broadcastos-podcast-record-mode"), next ? "on" : "off")
      } catch {
        // Ignore.
      }
      return next
    })
  }

  if (library === null) return null

  const active = activeId ? library.find((episode) => episode.id === activeId) ?? null : null

  const registerRef = (id: string, el: HTMLDivElement | null) => {
    cardRefs.current.set(id, el)
  }

  const toggle = (episode: PodcastEpisode, cardId: string) => {
    const covered = { ...episode.covered, [cardId]: !episode.covered[cardId] }
    setLibrary(updateEpisodeCovered(episode.id, covered))
  }

  const jumpToNext = (episode: PodcastEpisode) => {
    for (const section of episode.doc.sections) {
      for (const card of section.cards) {
        if (card.kind === "question" && !episode.covered[card.id]) {
          cardRefs.current.get(card.id)?.scrollIntoView({ behavior: "smooth", block: "center" })
          return
        }
      }
    }
  }

  const loadDraft = () => {
    const parsed = parsePodcastNotes(draft)
    if (!parsed.sections.length && !parsed.openScript.length) return
    const next = addEpisode(parsed)
    setLibrary(next)
    setDraft("")
    setAdding(false)
    setActiveId(next[0].id)
  }

  if (active) {
    const total = questionCount(active.doc)
    const done = coveredCount(active)
    return (
      <div className={cn(recordMode && "min-h-dvh bg-black")}>
        <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24">
          <div
            className={cn(
              "sticky top-0 z-10 -mx-6 border-b px-6 py-3 backdrop-blur",
              recordMode ? "border-zinc-800 bg-black/90" : "border-border/60 bg-background/90"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 rounded-lg" onClick={() => setActiveId(null)}>
                  <ArrowLeft className="size-3.5" />Episodes
                </Button>
                <div className="min-w-0">
                  <h1 className={cn("truncate text-lg font-semibold tracking-[-0.02em]", recordMode && "text-white")}>{active.doc.title}</h1>
                  <p className={cn("text-xs", recordMode ? "text-zinc-400" : "text-muted-foreground")}>
                    {done} of {total} questions covered
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg"
                  onClick={toggleRecordMode}
                  aria-label={recordMode ? "Switch to daylight" : "Switch to record mode"}
                >
                  {recordMode ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                  {recordMode ? "Daylight" : "Record mode"}
                </Button>
                <Button variant="outline" size="sm" className="h-9 rounded-lg" onClick={() => jumpToNext(active)}>
                  <ArrowDown className="size-3.5" />Next up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg"
                  onClick={() => setLibrary(updateEpisodeCovered(active.id, {}))}
                  aria-label="Clear all covered marks"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <SpokenBlock
            label="The open · read this to start"
            lines={active.doc.openScript}
            dark={recordMode}
            hint="Recording to camera? Email this open to autocue@premier.org.uk before the session… it goes on the autocue."
          />

          {active.doc.sections.map((section) => (
            <section key={section.id} className="space-y-3">
              <h2 className={cn("text-sm font-semibold uppercase tracking-wide", recordMode ? "text-zinc-500" : "text-muted-foreground")}>{section.title}</h2>
              {section.cards.map((card) => (
                <CardView
                  key={card.id}
                  card={card}
                  covered={Boolean(active.covered[card.id])}
                  dark={recordMode}
                  onToggle={() => toggle(active, card.id)}
                  registerRef={registerRef}
                />
              ))}
            </section>
          ))}

          <SpokenBlock label="The close · read this to finish" lines={active.doc.closeScript ?? []} dark={recordMode} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Podcast</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your episodes live here… load as many as the day needs and switch between them mid-session.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => setAdding((value) => !value)}>
          <Plus className="size-4" />Add episode
        </Button>
      </div>

      {(adding || library.length === 0) && (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Paste the whole prep document here… headings, numbered questions, transitions, the open and the close are picked up automatically."
            className="h-64 w-full rounded-xl border border-border bg-background p-4 text-sm leading-relaxed outline-none focus:border-brand-indigo/50"
          />
          <Button onClick={loadDraft} disabled={!draft.trim()} className="rounded-xl">
            <Mic2 className="size-4" />Load the episode
          </Button>
        </div>
      )}

      {library.length > 0 && (
        <div className="space-y-3">
          {library.map((episode) => {
            const total = questionCount(episode.doc)
            const done = coveredCount(episode)
            return (
              <div
                key={episode.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <button type="button" className="min-w-0 flex-1 cursor-pointer text-left" onClick={() => setActiveId(episode.id)}>
                  <h2 className="truncate text-lg font-semibold tracking-[-0.02em]">{episode.doc.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {done} of {total} covered · saved {savedDate(episode.savedAt)}
                  </p>
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 rounded-lg text-destructive hover:text-destructive"
                  aria-label={`Remove ${episode.doc.title}`}
                  onClick={() => {
                    if (window.confirm(`Remove "${episode.doc.title}" from the shelf?`)) {
                      setLibrary(removeEpisode(episode.id))
                    }
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
