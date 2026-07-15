"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  MessageCircle,
  Play,
  Plus,
  Radio,
  RotateCcw,
  ShieldCheck,
  Square,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StudioLivePill } from "@/components/app-shell"
import { openAppSplash } from "@/components/app-splash-screen"
import { LaunchSequenceBody, LaunchSequenceIndicator } from "@/components/show-launch-sequence"
import { StudioAmbient } from "@/components/studio-motion"
import { useLaunchSequence } from "@/lib/launch-sequence"
import { useListenerLog } from "@/lib/listener-log"
import {
  saveStudioWorkspace,
  studioShows,
  useStudioWorkspace,
} from "@/lib/studio-workspace"
import { getUkTimeLabel } from "@/lib/schedule-data"
import { useScheduleClock } from "@/lib/use-schedule-clock"
import { cn } from "@/lib/utils"

function isLinerLink(item?: { title?: string; script?: string }) {
  if (!item) return false
  return /liner link|station liner|\bP[12]\b/i.test(item.title ?? "") || /\[LINER STARTS HERE/i.test(item.script ?? "")
}

const wordsPerMinute = 150

type PrompterState = "off" | "rolling" | "paused"

export function UsableOnAir() {
  const workspace = useStudioWorkspace()
  const clock = useScheduleClock()
  const firstOpen = Math.max(0, workspace.items.findIndex((item) => !item.done))
  const [activeIndex, setActiveIndex] = useState(firstOpen)
  const [markingDone, setMarkingDone] = useState(false)
  const [studioResetConfirmed, setStudioResetConfirmed] = useState(false)
  const [responseChoices, setResponseChoices] = useState<Record<string, "yes" | "no">>({})
  const [prompter, setPrompter] = useState<PrompterState>("off")
  const [listenerName, setListenerName] = useState("")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLElement>(null)
  const prompterControl = useRef<{ raf: number; last: number; speed: number; target: number; paused: boolean } | null>(null)

  const current = workspace.items[activeIndex]
  const next = workspace.items[activeIndex + 1]
  const progress = workspace.items.length ? ((activeIndex + (current?.done ? 1 : 0)) / workspace.items.length) * 100 : 0
  const show = studioShows[workspace.showId]
  const isLastItem = activeIndex === workspace.items.length - 1
  const launchSequence = useLaunchSequence(workspace.showId, workspace.date)
  const hourItems = useMemo(() => workspace.items.filter((item) => item.hour === current?.hour), [current?.hour, workspace.items])
  const hourIndex = current ? hourItems.findIndex((item) => item.id === current.id) : -1
  const hourLinkTotal = hourItems.length || workspace.items.length
  const hourLinkNumber = hourIndex >= 0 ? hourIndex + 1 : activeIndex + 1
  const hourLabel = current?.hour || "This hour"
  const finalResetRequired = Boolean(current?.done && isLastItem && !studioResetConfirmed)
  const responseChoice = current ? responseChoices[current.id] : undefined
  const hasResponseGate = Boolean(current?.responseGate && current?.momentNoResponses?.trim() && current?.script?.trim())
  const responseGateOpen = hasResponseGate && !responseChoice
  const visibleMoment = hasResponseGate && responseChoice === "no"
    ? current?.momentNoResponses ?? ""
    : current?.script ?? ""
  const linerLink = isLinerLink(current)
  const showDate = workspace.date || new Date().toISOString().slice(0, 10)
  const listeners = useListenerLog(workspace.showId, showDate)

  const stopPrompter = useCallback(() => {
    if (prompterControl.current) {
      window.cancelAnimationFrame(prompterControl.current.raf)
      prompterControl.current = null
    }
    setPrompter("off")
  }, [])

  useEffect(() => {
    stopPrompter()
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [activeIndex, stopPrompter])

  useEffect(() => stopPrompter, [stopPrompter])

  function startPrompter() {
    const container = scrollContainerRef.current
    const script = scriptRef.current
    if (!container || !script || !current) return

    const text = [current.context, current.recap, visibleMoment, current.cta, current.tease].join(" ")
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const seconds = Math.max(15, (words / wordsPerMinute) * 60)
    const scriptBottom = container.scrollTop + script.getBoundingClientRect().bottom
    const target = Math.min(
      container.scrollHeight - container.clientHeight,
      Math.max(container.scrollTop, scriptBottom - container.clientHeight * 0.4)
    )
    const distance = target - container.scrollTop
    if (distance <= 0) return

    const control = { raf: 0, last: performance.now(), speed: distance / (seconds * 1000), target, paused: false }
    prompterControl.current = control
    setPrompter("rolling")

    const step = (timestamp: number) => {
      const active = prompterControl.current
      if (!active) return
      if (!active.paused) {
        container.scrollTop += active.speed * (timestamp - active.last)
        if (container.scrollTop >= active.target - 1) {
          prompterControl.current = null
          setPrompter("off")
          return
        }
      }
      active.last = timestamp
      active.raf = window.requestAnimationFrame(step)
    }
    control.raf = window.requestAnimationFrame(step)
  }

  function pausePrompter() {
    if (prompterControl.current) prompterControl.current.paused = true
    setPrompter("paused")
  }

  function resumePrompter() {
    if (prompterControl.current) prompterControl.current.paused = false
    setPrompter("rolling")
  }

  function moveToItem(index: number) {
    setStudioResetConfirmed(false)
    setActiveIndex(Math.min(workspace.items.length - 1, Math.max(0, index)))
  }

  function markDone() {
    if (!current || markingDone || responseGateOpen) return
    stopPrompter()
    setMarkingDone(true)
    window.setTimeout(() => {
      saveStudioWorkspace({
        ...workspace,
        items: workspace.items.map((item) => item.id === current.id ? { ...item, done: true } : item),
      })
      setMarkingDone(false)
      if (!isLastItem) moveToItem(activeIndex + 1)
    }, 450)
  }

  function chooseResponses(choice: "yes" | "no") {
    if (!current) return
    setResponseChoices((choices) => ({ ...choices, [current.id]: choice }))
  }

  function addListener() {
    if (!listenerName.trim()) return
    listeners.logMessage(listenerName)
    setListenerName("")
  }

  if (!current) {
    return (
      <div className="fixed inset-0 z-[45] grid place-items-center bg-[#08090d] p-6 text-white">
        <div className="max-w-lg text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-ink"><Radio /></span>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">No show is loaded yet</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">Import or build today&apos;s show in Produce, then come back here to read it.</p>
          <Button asChild className="mt-6 h-11 rounded-xl bg-white text-ink hover:bg-white/90"><Link href="/producer"><ArrowLeft />Go to Produce</Link></Button>
        </div>
      </div>
    )
  }

  const liveSteps = [
    {
      number: "1",
      label: "Context",
      helper: "Say this first",
      text: current.context || "No context added yet.",
      className: "border-violet-400/35 bg-violet-500/12",
      labelClassName: "text-violet-200",
      textClassName: "text-[28px] font-semibold leading-[1.35] tracking-[-0.035em] sm:text-[38px]",
    },
    {
      number: "2",
      label: "Recap",
      helper: "For anyone just joining",
      text: current.recap || "No recap added.",
      className: "border-white/10 bg-white/[0.045]",
      labelClassName: "text-white/45",
      textClassName: "text-[22px] font-medium leading-[1.45] tracking-[-0.02em] sm:text-[28px]",
    },
    {
      number: "3",
      label: "The Moment",
      helper: hasResponseGate ? (responseChoice === "no" ? "If no responses" : "If responses") : "One clear idea only",
      text: visibleMoment || "No main content added yet.",
      className: linerLink ? "border-fuchsia-300/30 bg-fuchsia-400/10" : "border-white/10 bg-white/[0.045]",
      labelClassName: linerLink ? "text-fuchsia-100" : "text-white/45",
      textClassName: "text-[22px] font-medium leading-[1.45] tracking-[-0.02em] sm:text-[28px]",
    },
    {
      number: "4",
      label: "Call To Action",
      helper: "Ask for one thing",
      text: current.cta || "No CTA added.",
      className: "border-fuchsia-400/25 bg-fuchsia-500/10",
      labelClassName: "text-fuchsia-200",
      textClassName: "text-[23px] font-semibold leading-[1.35] tracking-[-0.02em] sm:text-[30px]",
    },
    {
      number: "5",
      label: "Tease ahead",
      helper: "Give them a reason to stay",
      text: current.tease || "No tease added.",
      className: "border-cyan-300/20 bg-cyan-300/10",
      labelClassName: "text-cyan-100",
      textClassName: "text-[21px] font-semibold leading-[1.4] tracking-[-0.02em] sm:text-[27px]",
    },
  ]

  return (
    <div ref={scrollContainerRef} className="fixed inset-0 z-[45] overflow-auto bg-[#08090d] text-white">
      <StudioAmbient />
      {!launchSequence.complete && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#08090d] p-5 text-white sm:p-8">
          <StudioAmbient />
          <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center">
            <div className="rounded-[34px] border border-red-300/25 bg-white/[0.045] p-5 shadow-[0_30px_120px_rgba(0,0,0,.45)] sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge className="bg-red-600 text-white"><LockKeyhole />Pre-launch required</Badge>
                  <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Stop. Check the studio first.</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
                    On Air unlocks when the live London launch checks are complete, or when this show is marked as pre-recorded.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Checks complete</p>
                  <p className="mt-1 font-mono text-4xl font-black">{launchSequence.completedCount}/{launchSequence.totalCount}</p>
                </div>
              </div>
              <div className="mt-7">
                <LaunchSequenceBody showId={workspace.showId} date={workspace.date} dark />
              </div>
            </div>
          </div>
        </div>
      )}
      {finalResetRequired && (
        <div className="fixed inset-0 z-[75] grid place-items-center overflow-y-auto bg-[#08090d] p-5 text-white sm:p-8">
          <StudioAmbient />
          <div className="relative w-full max-w-3xl rounded-[36px] border border-amber-300/30 bg-amber-300/[0.10] p-6 shadow-[0_30px_120px_rgba(0,0,0,.55)] sm:p-9">
            <Badge className="bg-amber-300 text-ink"><AlertTriangle />End of show reset required</Badge>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              Switch Zetta from Live Assist back to Auto.
            </h1>
            <p className="mt-5 text-lg leading-8 text-amber-50/80">
              Do this before leaving the studio. This screen stays here until you confirm the studio has been reset.
            </p>
            <div className="mt-7 rounded-[26px] border border-white/10 bg-black/25 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100">Final checks</p>
              <ul className="mt-4 space-y-3 text-base text-white/80">
                <li className="flex gap-3"><Check className="mt-0.5 size-5 text-amber-200" />Zetta switched from Live Assist to Auto.</li>
                <li className="flex gap-3"><Check className="mt-0.5 size-5 text-amber-200" />Mic volume slider brought down.</li>
                <li className="flex gap-3"><Check className="mt-0.5 size-5 text-amber-200" />Channel 3/beds/cues brought down.</li>
              </ul>
            </div>
            <div className="mt-7">
              <Button className="h-14 w-full rounded-2xl bg-amber-300 text-base font-semibold text-ink hover:bg-amber-200" onClick={() => setStudioResetConfirmed(true)}>
                <ShieldCheck />I&apos;ve reset the studio
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#08090d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={openAppSplash}
              aria-label="Open BroadcastOS menu"
              className="relative grid h-10 w-[58px] shrink-0 place-items-center rounded-xl bg-white px-2 shadow-sm transition-transform hover:scale-[1.03]"
            >
              <Image src="/premier-logo.svg" alt="Premier" width={126} height={59} priority className="h-auto w-[46px]" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{show.name}</p>
              <p className="text-[10px] text-white/40">{hourLabel} · Link {hourLinkNumber} of {hourLinkTotal} · {activeIndex + 1} of {workspace.items.length} in the show</p>
            </div>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <StudioLivePill dark />
            <div className="text-center">
              <p className="font-mono text-2xl font-semibold">{getUkTimeLabel(new Date(clock))}</p>
              <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">UK time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LaunchSequenceIndicator showId={workspace.showId} date={workspace.date} />
            <Button asChild variant="outline" className="h-10 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <Link href="/producer"><ArrowLeft />Exit</Link>
            </Button>
          </div>
        </div>
        <div className="h-2.5 overflow-hidden bg-white/5">
          <div className="relative h-full rounded-r-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 transition-all duration-700 ease-out" style={{ width: `${progress}%` }}>
            <span className="absolute right-0 top-1/2 size-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,.85)]" />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1500px] space-y-4 px-5 pb-32 pt-4 sm:px-8">
        {isLastItem && (
          <section className="rounded-[24px] border border-amber-300/30 bg-amber-300/[0.12] p-5">
            <div className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-300 text-ink">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100">End of show studio reset</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
                  After the final link, switch Zetta from Live Assist back to Auto.
                </h2>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_70px_rgba(0,0,0,.2)]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-red-50 text-red-600"><span className="studio-live-dot" />Current</Badge>
            {hasResponseGate && <Badge className="bg-violet-200 text-violet-950">Response Gate</Badge>}
            {linerLink && <Badge className="bg-fuchsia-200 text-fuchsia-950">Liner</Badge>}
            {current.time && <span className="font-mono text-[10px] text-white/40">{current.time}</span>}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{current.title}</h1>
          {current.objective && <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">{current.objective}</p>}
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
          <section className="space-y-4">
            <article ref={scriptRef} className="rounded-[30px] border border-white/10 bg-white/[0.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,.24)] sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">Your script</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] sm:text-2xl">Read from top to bottom</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {hasResponseGate && responseChoice && (
                    <div className="inline-flex rounded-xl border border-violet-300/30 bg-violet-400/[0.08] p-1" role="group" aria-label="Responses">
                      <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-200">Responses</span>
                      {(["yes", "no"] as const).map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          aria-pressed={responseChoice === choice}
                          onClick={() => chooseResponses(choice)}
                          className={cn(
                            "min-h-8 rounded-lg px-3 text-xs font-bold uppercase transition-colors",
                            responseChoice === choice ? "bg-white text-ink" : "text-white/50 hover:text-white"
                          )}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  )}
                  {!responseGateOpen && prompter === "off" && (
                    <Button
                      className="h-10 rounded-xl bg-white px-4 text-ink hover:bg-white/90"
                      onClick={startPrompter}
                    >
                      <Play className="size-4" />Start reading
                    </Button>
                  )}
                </div>
              </div>

              {responseGateOpen ? (
                <div className="rounded-[28px] border border-violet-300/35 bg-violet-400/[0.13] p-6 text-center sm:p-8">
                  <Badge className="bg-violet-200 text-violet-950">Response Gate</Badge>
                  <h3 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                    Do you have listener responses?
                  </h3>
                  <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-violet-50/70">
                    You can switch your answer at any time while this link is open.
                  </p>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <Button
                      className="h-24 rounded-[26px] bg-emerald-300 text-2xl font-black text-ink hover:bg-emerald-200"
                      onClick={() => chooseResponses("yes")}
                    >
                      <CheckCircle2 className="size-7" />YES
                    </Button>
                    <Button
                      className="h-24 rounded-[26px] bg-white text-2xl font-black text-ink hover:bg-white/90"
                      onClick={() => chooseResponses("no")}
                    >
                      <ArrowRight className="size-7" />NO
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveSteps.map((step) => (
                  <section key={step.number} className={`rounded-[24px] border p-5 sm:p-6 ${step.className}`}>
                    <div className="flex gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-base font-semibold text-ink sm:size-12">{step.number}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${step.labelClassName}`}>{step.label}</p>
                          <span className="text-[10px] text-white/30">· {step.helper}</span>
                        </div>
                        <p className={`mt-3 whitespace-pre-wrap ${step.textClassName}`}>{step.text}</p>
                      </div>
                    </div>
                  </section>
                  ))}
                </div>
              )}
            </article>

            {current.notes && (
              <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Producer notes</p>
                <p className="mt-3 text-sm leading-6 text-white/75">{current.notes}</p>
              </div>
            )}
            {current.stationRequirement && (
              <div className="rounded-[22px] border border-amber-300/20 bg-amber-300/[0.08] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100">Station reminder</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-amber-50/85">{current.stationRequirement}</p>
              </div>
            )}
            <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100">What comes next</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-cyan-50/85">{current.next || next?.title || "End of show"}</p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Up next</p>
              {next ? (
                <>
                  <p className="mt-3 text-xl font-semibold">{next.title}</p>
                  {(next.time || next.duration) && <p className="mt-2 font-mono text-xs text-white/45">{[next.time, next.duration].filter(Boolean).join(" · ")}</p>}
                  {next.objective && <p className="mt-3 text-sm leading-6 text-white/60">{next.objective}</p>}
                </>
              ) : (
                <p className="mt-3 text-lg font-semibold">End of show</p>
              )}
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Listeners this show</p>
                <Badge className="bg-white/10 text-white">{listeners.totalMessages} message{listeners.totalMessages === 1 ? "" : "s"}</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Input
                  value={listenerName}
                  onChange={(event) => setListenerName(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") addListener() }}
                  placeholder="Who messaged in?"
                  className="h-11 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/25"
                />
                <Button className="h-11 rounded-xl bg-white px-3 text-ink hover:bg-white/90" onClick={addListener} aria-label="Log listener message">
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {listeners.entries.length ? listeners.entries.map((entry) => {
                  const allTime = listeners.allTime[entry.name.toLowerCase().replace(/\s+/g, " ").trim()]
                  return (
                    <div key={entry.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2.5">
                      <button
                        type="button"
                        onClick={() => listeners.logMessage(entry.name)}
                        className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 font-mono text-sm font-bold transition-colors hover:bg-white hover:text-ink"
                        aria-label={`Another message from ${entry.name}`}
                        title="Tap when they message again"
                      >
                        {entry.messageCount}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{entry.name}</p>
                        {allTime && allTime > entry.messageCount && (
                          <p className="text-[10px] text-white/40">{allTime} messages all time</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => listeners.removeEntry(entry.id)}
                        aria-label={`Remove ${entry.name}`}
                        className="grid size-8 place-items-center rounded-lg text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )
                }) : (
                  <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs leading-5 text-white/35">
                    Add a name when someone messages in. Tap their number each time they message again, and shout them out when it feels right.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#08090d]/95 px-5 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
          {prompter === "off" ? (
            <>
              <Button variant="outline" className="h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" disabled={activeIndex === 0} onClick={() => moveToItem(activeIndex - 1)}><ArrowLeft />Previous</Button>
              <Button
                className={cn(
                  "h-14 min-w-44 rounded-2xl px-8 text-base font-semibold transition-all duration-300",
                  markingDone ? "scale-110 bg-success text-white shadow-[0_0_45px_rgba(50,180,120,.55)]" : "bg-white text-ink hover:bg-white/90"
                )}
                onClick={markDone}
                disabled={markingDone || responseGateOpen}
              >
                {markingDone ? <RotateCcw className="animate-spin" /> : <Check />}
                {responseGateOpen ? "Choose YES or NO first" : markingDone ? "Done — moving…" : isLastItem ? "Finish show" : "Mark done"}
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" disabled={!next} onClick={() => moveToItem(activeIndex + 1)}>Next<ArrowRight /></Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={stopPrompter}
              >
                <Square className="size-4" />End reading
              </Button>
              {prompter === "rolling" ? (
                <Button
                  className="h-14 min-w-56 rounded-2xl bg-emerald-300 px-8 text-base font-semibold text-ink hover:bg-emerald-200"
                  onClick={pausePrompter}
                >
                  <MessageCircle className="size-5" />WhatsApp
                </Button>
              ) : (
                <Button
                  className="h-14 min-w-56 rounded-2xl bg-white px-8 text-base font-semibold text-ink hover:bg-white/90"
                  onClick={resumePrompter}
                >
                  <Play className="size-5" />Back to script
                </Button>
              )}
              <span className="hidden text-xs font-medium text-white/40 sm:block">
                {prompter === "rolling" ? "Scrolling with you" : "Paused for messages"}
              </span>
            </>
          )}
        </div>
      </footer>
    </div>
  )
}
