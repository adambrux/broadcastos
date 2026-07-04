"use client"

import { useEffect, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Headphones,
  MessageSquareText,
  Music2,
  Radio,
  Sparkles,
  Timer,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const liveItems = [
  {
    time: "09:10",
    title: "Sunday Show Congregation Roll Call",
    next: "Opening prayer",
    songRemaining: "01:42",
    objective: "Recognise the permanent congregation, welcome new regulars and make every listener feel part of the Sunday gathering.",
    script: "The Sunday Show Congregation is gathering. We are starting with our regular family, then making room for the new names joining us today. Wherever you are listening from, you are part of this.",
    cta: "Send your name, location and church on WhatsApp now.",
    producer: "Read established names first, then the four approved additions from the New Listener Queue.",
    timeCheck: "Time check before the next song.",
    stationId: "Premier Gospel station ID after prayer.",
  },
  {
    time: "09:24",
    title: "Opening Prayer",
    next: "Pastor Yvonne Reflection",
    songRemaining: "--:--",
    objective: "Centre the programme and pray for listeners, families, churches and the Sunday ahead.",
    script: "Wherever this morning has found you, let us take a moment together. Father, thank you for the gift of a new day and for every person gathered with us now.",
    cta: "No new CTA — allow the prayer to land.",
    producer: "Keep the prayer under three minutes. Leave a clean breath before the music bed rises.",
    timeCheck: "Give the time at the start of the reflection link.",
    stationId: "Station ID already complete this quarter.",
  },
  {
    time: "09:31",
    title: "Pastor Yvonne Reflection",
    next: "Listener voice notes",
    songRemaining: "00:36",
    objective: "Introduce the packaged reflection and leave listeners with one clear, practical thought.",
    script: "Pastor Yvonne is with us now with a reflection for anyone learning to trust God before the answer becomes visible.",
    cta: "Send a short voice note with the line that stayed with you.",
    producer: "Package duration 08:42. Leave two seconds at the end, then respond personally rather than adding a second sermon.",
    timeCheck: "Time check on the back-announce.",
    stationId: "Use the Sunday station liner after listener responses.",
  },
] as const

const reviewChecks = [
  "Read WhatsApp",
  "Played voice note",
  "Mentioned WhatsApp",
  "Mentioned text number",
  "Time check",
  "Station ID",
  "Teased ahead",
  "Prayer",
  "Mentioned Premier Plus",
  "Used station liner",
] as const

export function BroadcastOSLivePage() {
  const [clock, setClock] = useState("--:--:--")
  const [activeIndex, setActiveIndex] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const [tracking, setTracking] = useState<Record<number, string[]>>({})
  const item = liveItems[activeIndex]
  const itemChecks = tracking[activeIndex] ?? []

  useEffect(() => {
    function updateClock() {
      setClock(new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date()))
    }
    updateClock()
    const timer = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(timer)
  }, [])

  function toggleCheck(label: string) {
    setTracking((current) => {
      const currentChecks = current[activeIndex] ?? []
      return {
        ...current,
        [activeIndex]: currentChecks.includes(label)
          ? currentChecks.filter((item) => item !== label)
          : [...currentChecks, label],
      }
    })
  }

  function markDone() {
    setCompleted((current) => current.includes(activeIndex) ? current.filter((index) => index !== activeIndex) : [...current, activeIndex])
  }

  function move(direction: -1 | 1) {
    setActiveIndex((current) => Math.min(liveItems.length - 1, Math.max(0, current + direction)))
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-auto bg-[#08090d] text-white">
      <header className="border-b border-white/10 bg-[#08090d]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-ink">
              <Radio className="size-5" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-red-500" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">Sundays with Adam</p>
                <Badge className="bg-red-500/15 text-[9px] text-red-300 hover:bg-red-500/15">LIVE</Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-white/45">Premier Gospel · Adam Brooks</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{clock}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">Sunday 6 July</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-69px)] max-w-[1600px] flex-col gap-3 px-5 py-3 sm:px-8">
        <section className="grid gap-3 lg:grid-cols-[1.5fr_.75fr_.55fr]">
          <div className="rounded-[22px] border border-white/15 bg-white p-3.5 text-ink shadow-[0_18px_60px_rgba(0,0,0,.3)]">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">Current item · {item.time}</p>
              <span className="flex items-center gap-2 text-xs text-ink/55"><span className="size-1.5 rounded-full bg-red-500" />On air</span>
            </div>
            <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.035em]">{item.title}</h1>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_60px_rgba(0,0,0,.22)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Next item</p>
            <p className="mt-2.5 text-base font-semibold">{item.next}</p>
            <p className="mt-1 text-xs text-white/40">{liveItems[activeIndex + 1]?.time ?? "End of hour"}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_60px_rgba(0,0,0,.22)]">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40"><Music2 className="size-3.5" />Song remaining</p>
            <p className="mt-2 font-mono text-3xl font-semibold tracking-[-0.04em]">{item.songRemaining}</p>
          </div>
        </section>

        <div className="grid flex-1 gap-4 xl:grid-cols-[1.45fr_.75fr]">
          <section className="grid content-start gap-3">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-3.5 shadow-[0_18px_60px_rgba(0,0,0,.22)]">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-300"><Sparkles className="size-3.5" />Link objective</p>
              <p className="mt-2 text-sm font-medium leading-5 text-white/85">{item.objective}</p>
            </div>

            <div className="rounded-[22px] border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-white/[0.035] p-4 shadow-[0_18px_60px_rgba(0,0,0,.25)]">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-300">Suggested script</p>
                <Headphones className="size-4 text-violet-300" />
              </div>
              <blockquote className="mt-3 max-w-5xl text-lg font-medium leading-7 tracking-[-0.015em]">
                “{item.script}”
              </blockquote>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <CueCard icon={MessageSquareText} label="CTA" value={item.cta} accent />
              <CueCard icon={Timer} label="Producer reminder" value={item.producer} />
              <CueCard icon={Clock3} label="Time check reminder" value={item.timeCheck} />
              <CueCard icon={Radio} label="Station ID reminder" value={item.stationId} />
            </div>
          </section>

          <aside className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_60px_rgba(0,0,0,.22)] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">Review tracking</h2>
                <p className="mt-1 text-xs text-white/40">Tap as each action happens.</p>
              </div>
              <Badge variant="outline" className="border-white/15 text-white">{itemChecks.length}/{reviewChecks.length}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {reviewChecks.map((label) => {
                const checked = itemChecks.includes(label)
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleCheck(label)}
                    aria-pressed={checked}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors",
                      checked ? "border-emerald-400/25 bg-emerald-400/15 text-emerald-300" : "border-white/10 bg-white/[0.035] text-white/75 hover:border-violet-300/30 hover:bg-violet-400/10"
                    )}
                  >
                    <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border", checked ? "border-emerald-400 bg-emerald-400 text-emerald-950" : "border-white/20 bg-white/[0.03]")}>
                      {checked && <Check className="size-3" />}
                    </span>
                    {label}
                  </button>
                )
              })}
            </div>
          </aside>
        </div>

        <footer className="sticky bottom-0 -mx-5 mt-auto border-t border-white/10 bg-[#08090d]/95 px-5 py-2 backdrop-blur-xl sm:-mx-8 sm:px-8">
          <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => move(-1)}
              disabled={activeIndex === 0}
              className="h-11 rounded-xl border-white/15 bg-white/[0.06] px-5 text-white hover:bg-white/10 hover:text-white disabled:text-white/25"
            >
              <ArrowLeft />Previous
            </Button>
            <div className="hidden items-center gap-2 sm:flex">
              {liveItems.map((link, index) => (
                <span key={link.time} className={cn("h-1.5 rounded-full transition-all", index === activeIndex ? "w-8 bg-violet-300" : completed.includes(index) ? "w-3 bg-emerald-400" : "w-3 bg-white/15")} />
              ))}
            </div>
            <Button
              size="lg"
              onClick={markDone}
              className={cn("h-11 rounded-xl px-6", completed.includes(activeIndex) ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300" : "bg-white text-ink hover:bg-white/90")}
            >
              {completed.includes(activeIndex) ? <CheckCircle2 /> : <Check />}
              {completed.includes(activeIndex) ? "Completed" : "Done"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => move(1)}
              disabled={activeIndex === liveItems.length - 1}
              className="h-11 rounded-xl border-white/15 bg-white/[0.06] px-5 text-white hover:bg-white/10 hover:text-white disabled:text-white/25"
            >
              Next<ArrowRight />
            </Button>
          </div>
        </footer>
      </main>
    </div>
  )
}

function CueCard({ icon: Icon, label, value, accent = false }: { icon: typeof Radio; label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-[18px] border p-3.5 shadow-[0_16px_45px_rgba(0,0,0,.18)]", accent ? "border-violet-400/20 bg-violet-400/10" : "border-white/10 bg-white/[0.055]")}>
      <p className={cn("flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]", accent ? "text-violet-300" : "text-white/40")}>
        <Icon className="size-3.5" />{label}
      </p>
      <p className="mt-2 text-xs font-medium leading-5 text-white/80">{value}</p>
    </div>
  )
}
