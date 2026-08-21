"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowDown, Check, Mic2, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  clearPodcastDoc,
  loadCovered,
  loadPodcastDoc,
  parsePodcastNotes,
  questionCount,
  saveCovered,
  savePodcastDoc,
  type PodcastCard,
  type PodcastDoc,
} from "@/lib/podcast-notes"
import { cn } from "@/lib/utils"

function CardView({
  card,
  covered,
  onToggle,
  registerRef,
}: {
  card: PodcastCard
  covered: boolean
  onToggle: () => void
  registerRef: (id: string, el: HTMLDivElement | null) => void
}) {
  if (card.kind === "transition") {
    return (
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 h-full w-px bg-brand-indigo/30" aria-hidden />
        <p className="rounded-xl bg-brand-soft/60 px-4 py-3 text-[15px] italic leading-relaxed text-brand-indigo">
          {card.text}
        </p>
      </div>
    )
  }

  if (card.kind === "you") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">You at the table</p>
        <p className="mt-1 text-[15px] leading-relaxed text-amber-900">{card.text}</p>
      </div>
    )
  }

  if (card.kind === "note") {
    return <p className="px-1 text-sm leading-relaxed text-muted-foreground">{card.text}</p>
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
        "cursor-pointer rounded-2xl border bg-card p-5 shadow-sm transition-all",
        covered
          ? "border-border/50 opacity-45"
          : "border-border hover:border-brand-indigo/40 hover:shadow-[var(--shadow-lift)]"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
            covered ? "border-emerald-500 bg-emerald-500 text-white" : "border-border text-transparent"
          )}
          aria-hidden
        >
          <Check className="size-3.5" />
        </span>
        <p className={cn("text-lg leading-relaxed tracking-[-0.01em]", covered && "line-through decoration-1")}>{card.text}</p>
      </div>
    </div>
  )
}

export function PodcastModePage() {
  const [doc, setDoc] = useState<PodcastDoc | null>(null)
  const [covered, setCovered] = useState<Record<string, boolean>>({})
  const [draft, setDraft] = useState("")
  const [ready, setReady] = useState(false)
  const cardRefs = useRef(new Map<string, HTMLDivElement | null>())

  useEffect(() => {
    setDoc(loadPodcastDoc())
    setCovered(loadCovered())
    setReady(true)
  }, [])

  const total = useMemo(() => (doc ? questionCount(doc) : 0), [doc])
  const done = useMemo(
    () =>
      doc
        ? doc.sections.reduce(
            (sum, section) => sum + section.cards.filter((card) => card.kind === "question" && covered[card.id]).length,
            0
          )
        : 0,
    [doc, covered]
  )

  const registerRef = (id: string, el: HTMLDivElement | null) => {
    cardRefs.current.set(id, el)
  }

  const toggle = (id: string) => {
    setCovered((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      saveCovered(next)
      return next
    })
  }

  const jumpToNext = () => {
    if (!doc) return
    for (const section of doc.sections) {
      for (const card of section.cards) {
        if (card.kind === "question" && !covered[card.id]) {
          cardRefs.current.get(card.id)?.scrollIntoView({ behavior: "smooth", block: "center" })
          return
        }
      }
    }
  }

  const loadDraft = () => {
    const parsed = parsePodcastNotes(draft)
    if (!parsed.sections.length && !parsed.openScript.length) return
    savePodcastDoc(parsed)
    saveCovered({})
    setDoc(parsed)
    setCovered({})
    setDraft("")
  }

  const reset = () => {
    setCovered({})
    saveCovered({})
  }

  const remove = () => {
    clearPodcastDoc()
    setDoc(null)
    setCovered({})
  }

  if (!ready) return null

  if (!doc) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Podcast</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste a podcast prep below and it becomes tappable question cards… tap a question when it&apos;s covered, skip
            in any order, and the transitions stay in view so every jump still flows.
          </p>
        </div>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Paste the whole prep document here… headings, numbered questions and transition lines are picked up automatically."
          className="h-72 w-full rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed shadow-sm outline-none focus:border-brand-indigo/50"
        />
        <Button onClick={loadDraft} disabled={!draft.trim()} className="rounded-xl">
          <Mic2 className="size-4" />Load the podcast
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24">
      <div className="sticky top-0 z-10 -mx-6 border-b border-border/60 bg-background/90 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-[-0.02em]">{doc.title}</h1>
            <p className="text-xs text-muted-foreground">
              {done} of {total} questions covered
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-lg" onClick={jumpToNext}>
              <ArrowDown className="size-3.5" />Next up
            </Button>
            <Button variant="outline" size="sm" className="h-9 rounded-lg" onClick={reset} aria-label="Clear all covered marks">
              <RotateCcw className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg text-destructive hover:text-destructive"
              onClick={remove}
              aria-label="Remove this podcast"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {doc.openScript.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-indigo">The open · read this to start</p>
          <div className="mt-3 space-y-2">
            {doc.openScript.map((line, index) => (
              <p key={index} className="text-lg leading-relaxed tracking-[-0.01em]">
                {line}
              </p>
            ))}
          </div>
        </section>
      )}

      {doc.sections.map((section) => (
        <section key={section.id} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</h2>
          {section.cards.map((card) => (
            <CardView
              key={card.id}
              card={card}
              covered={Boolean(covered[card.id])}
              onToggle={() => toggle(card.id)}
              registerRef={registerRef}
            />
          ))}
        </section>
      ))}
    </div>
  )
}
