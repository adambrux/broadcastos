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
  ChevronDown,
  Flag,
  LockKeyhole,
  HandHeart,
  MessageCircle,
  Minus,
  Pencil,
  Play,
  Plus,
  Radio,
  RotateCcw,
  ShieldCheck,
  Square,
  Star,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StudioLivePill } from "@/components/app-shell"
import { openAppSplash } from "@/components/app-splash-screen"
import { GameScoreboard } from "@/components/game-scoreboard"
import { LaunchSequenceBody, LaunchSequenceIndicator } from "@/components/show-launch-sequence"
import { StudioAmbient } from "@/components/studio-motion"
import { useLaunchSequence } from "@/lib/launch-sequence"
import { listenerSources, useListenerLog, type ListenerSource } from "@/lib/listener-log"
import { reportScriptIssue } from "@/lib/script-issues"
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

const handoffWordClass = "font-bold text-emerald-300"
const numberTokenPattern = /^((?:answer|question|number|round|q)\s*(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b\s*[:.…]*|\d+[\).]\s*)/i

/** Renders a fragment of script text, colouring the word next to an interaction marker green. */
function renderTextPart(part: string, key: string, greenFirstWord: boolean, greenLastWord: boolean, highlightNumbers: boolean) {
  const nodes: React.ReactNode[] = []
  let remaining = part

  if (highlightNumbers) {
    const numberMatch = remaining.match(numberTokenPattern)
    if (numberMatch) {
      nodes.push(<span key={`${key}-num`} className="font-bold text-violet-300">{numberMatch[1]}</span>)
      remaining = remaining.slice(numberMatch[1].length)
    }
  }

  let head = ""
  let firstWord = ""
  if (greenFirstWord) {
    const match = remaining.match(/^(\s*)(\S+)([\s\S]*)$/)
    if (match) {
      head = match[1]
      firstWord = match[2]
      remaining = match[3]
    }
  }

  let lastWord = ""
  let tail = ""
  if (greenLastWord) {
    const match = remaining.match(/^([\s\S]*?)(\S+)(\s*)$/)
    if (match) {
      remaining = match[1]
      lastWord = match[2]
      tail = match[3]
    }
  }

  if (head) nodes.push(head)
  if (firstWord) nodes.push(<span key={`${key}-first`} className={handoffWordClass}>{firstWord}</span>)
  if (remaining) nodes.push(remaining)
  if (lastWord) nodes.push(<span key={`${key}-last`} className={handoffWordClass}>{lastWord}</span>)
  if (tail) nodes.push(tail)
  return nodes
}

/**
 * Script text renderer for On Air: each line becomes its own paragraph,
 * [bracketed directions] become pills with the words either side of them
 * coloured green (the eyes-back-from-WhatsApp anchor), and leading
 * question/answer numbers are highlighted so the payoff parade scans.
 */
function renderScript(text: string) {
  return text.split("\n").filter((line) => line.trim().length > 0).map((line, lineIndex) => {
    const parts = line.split(/(\[[^\]]*\])/g).filter((part) => part.length > 0)
    return (
      <p key={lineIndex} className="mb-3 last:mb-0">
        {parts.map((part, partIndex) => {
          if (part.startsWith("[") && part.endsWith("]")) {
            return (
              <span
                key={partIndex}
                className="mx-1.5 inline-block max-w-full rounded-lg border border-emerald-300/40 bg-emerald-400/[0.12] px-2.5 py-1 align-middle text-[0.5em] font-bold uppercase leading-snug tracking-[0.08em] text-emerald-200"
              >
                {part.slice(1, -1)}
              </span>
            )
          }
          const prevIsMarker = partIndex > 0 && parts[partIndex - 1].startsWith("[")
          const nextIsMarker = partIndex < parts.length - 1 && parts[partIndex + 1].startsWith("[")
          return renderTextPart(part, `${lineIndex}-${partIndex}`, prevIsMarker, nextIsMarker, partIndex === 0)
        })}
      </p>
    )
  })
}

const wordsPerMinute = 150

type PrompterState = "off" | "countdown" | "rolling" | "paused"

const keeperTags = [
  { value: "keeper", label: "Worth keeping" },
  { value: "prayer", label: "Prayer request" },
  { value: "birthday", label: "Birthday" },
  { value: "favourite-song", label: "Favourite song" },
] as const

export function UsableOnAir() {
  const workspace = useStudioWorkspace()
  const clock = useScheduleClock()
  const firstOpen = Math.max(0, workspace.items.findIndex((item) => !item.done))
  const [activeIndex, setActiveIndex] = useState(firstOpen)
  const [markingDone, setMarkingDone] = useState(false)
  const [studioResetConfirmed, setStudioResetConfirmed] = useState(false)
  const [responseChoices, setResponseChoices] = useState<Record<string, "yes" | "no">>({})
  const [prompter, setPrompter] = useState<PrompterState>("off")
  const [countdown, setCountdown] = useState(5)
  const [listenerName, setListenerName] = useState("")
  const [namesOpen, setNamesOpen] = useState(false)
  const [source, setSource] = useState<ListenerSource>("whatsapp")
  const [keeperFor, setKeeperFor] = useState("")
  const [keeperTag, setKeeperTag] = useState<string>("keeper")
  const [keeperText, setKeeperText] = useState("")
  const [keeperNotice, setKeeperNotice] = useState("")
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [reporting, setReporting] = useState(false)
  const [issueText, setIssueText] = useState("")
  const [issueInstead, setIssueInstead] = useState("")
  const [issueNotice, setIssueNotice] = useState("")
  const [transitionCard, setTransitionCard] = useState<{ label: string; title: string } | null>(null)
  // Prompter speed preference: 1 is the classic pace, saved on this device.
  const [prompterSpeed, setPrompterSpeed] = useState(1)
  const transitionTimer = useRef<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prompterControl = useRef<{ raf: number; last: number; speed: number; target: number; pos: number; paused: boolean } | null>(null)
  const countdownTimer = useRef<number | null>(null)

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
    if (countdownTimer.current !== null) {
      window.clearInterval(countdownTimer.current)
      countdownTimer.current = null
    }
    setPrompter("off")
  }, [])

  useEffect(() => {
    stopPrompter()
    setEditing(false)
    setReporting(false)
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [activeIndex, stopPrompter])

  useEffect(() => stopPrompter, [stopPrompter])

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem("broadcastos-prompter-speed"))
      if (stored && stored >= 0.5 && stored <= 2) setPrompterSpeed(stored)
    } catch { /* default pace stands */ }
    return () => {
      if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current)
    }
  }, [])

  function cyclePrompterSpeed() {
    const steps = [0.75, 1, 1.25, 1.5]
    const next = steps[(steps.indexOf(prompterSpeed) + 1) % steps.length] ?? 1
    applyPrompterSpeed(next)
  }

  // Speed changes apply INSTANTLY, even mid-scroll… the live control scales
  // the roll that's already running, and the choice sticks on this device.
  function applyPrompterSpeed(next: number) {
    const clamped = Math.min(2, Math.max(0.5, Math.round(next * 4) / 4))
    if (prompterControl.current && prompterSpeed > 0) {
      prompterControl.current.speed = (prompterControl.current.speed / prompterSpeed) * clamped
    }
    setPrompterSpeed(clamped)
    try { window.localStorage.setItem("broadcastos-prompter-speed", String(clamped)) } catch { /* fine */ }
  }

  function nudgePrompterSpeed(delta: number) {
    applyPrompterSpeed(prompterSpeed + delta)
  }

  function restartPrompter() {
    const container = scrollContainerRef.current
    if (!container) return
    stopPrompter()
    container.scrollTo({ top: 0 })
    window.setTimeout(() => beginScroll(), 80)
  }

  function startCountdown() {
    if (prompter !== "off") return
    setCountdown(5)
    setPrompter("countdown")
    countdownTimer.current = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          if (countdownTimer.current !== null) {
            window.clearInterval(countdownTimer.current)
            countdownTimer.current = null
          }
          beginScroll()
          return 0
        }
        return value - 1
      })
    }, 1000)
  }

  function beginScroll() {
    const container = scrollContainerRef.current
    if (!container || !current) {
      setPrompter("off")
      return
    }

    const text = [current.context, current.recap, visibleMoment, current.cta, current.tease].join(" ")
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const seconds = Math.max(15, (words / (wordsPerMinute * prompterSpeed)) * 60)
    // Roll to the bottom of the page so there is always somewhere to go.
    const target = container.scrollHeight - container.clientHeight
    const distance = target - container.scrollTop
    if (distance <= 4) {
      setPrompter("off")
      return
    }

    const control = {
      raf: 0,
      last: performance.now(),
      speed: distance / (seconds * 1000),
      target,
      // Track position ourselves: Safari rounds scrollTop, which would swallow
      // sub-pixel steps and freeze the scroll entirely.
      pos: container.scrollTop,
      paused: false,
    }
    prompterControl.current = control
    setPrompter("rolling")

    const step = (timestamp: number) => {
      const active = prompterControl.current
      if (!active) return
      if (!active.paused) {
        active.pos = Math.min(active.target, active.pos + active.speed * (timestamp - active.last))
        container.scrollTop = active.pos
        if (active.pos >= active.target - 1) {
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
      if (!isLastItem) {
        // A link change must be unmissable: flash the next link's number and
        // title full-screen so a double-tap can never silently skip a link.
        if (next) {
          const nextHourItems = workspace.items.filter((item) => item.hour === next.hour)
          const nextNumber = nextHourItems.findIndex((item) => item.id === next.id) + 1
          setTransitionCard({ label: `LINK ${nextNumber || activeIndex + 2}`, title: next.title || "" })
          if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current)
          transitionTimer.current = window.setTimeout(() => setTransitionCard(null), 1600)
        }
        moveToItem(activeIndex + 1)
      }
    }, 450)
  }

  function chooseResponses(choice: "yes" | "no") {
    if (!current) return
    setResponseChoices((choices) => ({ ...choices, [current.id]: choice }))
  }

  function addListener(name = listenerName) {
    if (!name.trim()) return
    listeners.logMessage(name, source)
    setListenerName("")
  }

  async function saveKeeper() {
    if (!keeperFor || !keeperText.trim()) return
    try {
      await listeners.saveKeeper(keeperFor, keeperTag, keeperText)
      setKeeperNotice(`Saved for ${keeperFor}.`)
      setKeeperFor("")
      setKeeperText("")
      setKeeperTag("keeper")
      window.setTimeout(() => setKeeperNotice(""), 3000)
    } catch (error) {
      setKeeperNotice(error instanceof Error ? error.message : "Could not save that yet.")
    }
  }

  function startEditing() {
    if (!current) return
    stopPrompter()
    setReporting(false)
    setDraft({
      context: current.context,
      recap: current.recap,
      script: current.script,
      momentNoResponses: current.momentNoResponses,
      cta: current.cta,
      tease: current.tease,
    })
    setEditing(true)
  }

  function saveEdits() {
    if (!current) return
    saveStudioWorkspace({
      ...workspace,
      items: workspace.items.map((item) => item.id === current.id
        ? {
          ...item,
          context: draft.context ?? item.context,
          recap: draft.recap ?? item.recap,
          script: draft.script ?? item.script,
          momentNoResponses: draft.momentNoResponses ?? item.momentNoResponses,
          cta: draft.cta ?? item.cta,
          tease: draft.tease ?? item.tease,
        }
        : item),
    })
    setEditing(false)
  }

  function submitIssue() {
    if (!current) return
    reportScriptIssue({
      showId: workspace.showId,
      showDate,
      linkTitle: current.title,
      hour: hourLabel,
      linkPosition: `Link ${hourLinkNumber} of ${hourLinkTotal}`,
      flaggedText: issueText,
      saidInstead: issueInstead,
    })
    setIssueText("")
    setIssueInstead("")
    setReporting(false)
    setIssueNotice("Flagged… it's waiting for you on the Script issues page.")
    window.setTimeout(() => setIssueNotice(""), 3500)
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
    <div ref={scrollContainerRef} className="fixed inset-0 z-[45] overflow-auto bg-[#07080c] bg-[radial-gradient(ellipse_at_top,rgba(96,50,166,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(237,27,152,0.06),transparent_50%)] text-white">
      {transitionCard && (
        <div className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-black/85">
          <div className="text-center">
            <p className="text-xl font-bold uppercase tracking-[0.35em] text-emerald-300">Next</p>
            <p className="mt-3 text-7xl font-black text-white sm:text-8xl">{transitionCard.label}</p>
            <p className="mx-auto mt-5 max-w-2xl px-6 text-2xl font-semibold leading-9 text-white/85">{transitionCard.title}</p>
          </div>
        </div>
      )}
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

      {prompter === "countdown" && (
        <button
          type="button"
          onClick={stopPrompter}
          aria-label="Cancel countdown"
          className="fixed inset-0 z-[65] grid place-items-center bg-[#08090d]/90 backdrop-blur-sm"
        >
          <span className="text-center">
            <span className="block font-mono text-[38vh] font-black leading-none text-white">{countdown}</span>
            <span className="mt-2 block text-sm font-semibold uppercase tracking-[0.2em] text-white/40">Scrolling starts… tap to cancel</span>
          </span>
        </button>
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
              <p className="text-[10px] text-white/40">{hourLabel}</p>
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
          <section className={cn(
            "rounded-[24px] border border-amber-300/30 bg-amber-300/[0.12] p-5",
            !studioResetConfirmed && "animate-pulse"
          )}>
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-red-50 text-red-600"><span className="studio-live-dot" />Current</Badge>
                {hasResponseGate && <Badge className="bg-violet-200 text-violet-950">Response Gate</Badge>}
                {linerLink && <Badge className="bg-fuchsia-200 text-fuchsia-950">Liner</Badge>}
                {current.time && <span className="font-mono text-[10px] text-white/40">{current.time}</span>}
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{current.title}</h1>
              {current.objective && <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">{current.objective}</p>}
            </div>
            <div className="shrink-0 rounded-2xl border border-white/10 bg-black/25 px-5 py-3.5 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">{hourLabel}</p>
              <p className="mt-0.5 font-mono text-5xl font-black leading-none tracking-[-0.05em]">
                {hourLinkNumber}<span className="text-2xl text-white/35">/{hourLinkTotal}</span>
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-white/45">{activeIndex + 1} of {workspace.items.length} in the show</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
          <section className="space-y-4">
            <article className="rounded-[30px] border border-white/10 bg-white/[0.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,.24)] sm:p-5">
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
                  {prompter === "off" && !editing && (
                    <>
                      <Button
                        variant="outline"
                        className="h-10 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                        aria-pressed={reporting}
                        onClick={() => setReporting((value) => !value)}
                      >
                        <Flag className="size-4" />Flag
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                        onClick={startEditing}
                      >
                        <Pencil className="size-4" />Edit
                      </Button>
                    </>
                  )}
                  {!responseGateOpen && prompter === "off" && !editing && (
                    <Button
                      className="h-10 rounded-xl bg-white px-4 text-ink hover:bg-white/90"
                      onClick={startCountdown}
                    >
                      <Play className="size-4" />Start reading
                    </Button>
                  )}
                  {!responseGateOpen && prompter === "off" && !editing && (
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl border-white/15 bg-white/5 font-mono text-white hover:bg-white/10 hover:text-white"
                      onClick={cyclePrompterSpeed}
                      aria-label={`Reading speed ${prompterSpeed} times… tap to change`}
                    >
                      {prompterSpeed}x
                    </Button>
                  )}
                </div>
              </div>

              {issueNotice && (
                <p className="mb-3 rounded-xl bg-emerald-400/15 px-4 py-2.5 text-sm font-semibold text-emerald-200">{issueNotice}</p>
              )}

              {reporting && !editing && (
                <div className="mb-3 rounded-[24px] border border-amber-300/30 bg-amber-300/[0.08] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100">Flag this link · doesn&apos;t sound like me</p>
                  <p className="mt-2 text-xs leading-5 text-white/50">Both boxes are optional… flag it empty mid-show and fill it in later on the Script issues page.</p>
                  <textarea
                    value={issueText}
                    onChange={(event) => setIssueText(event.target.value)}
                    placeholder="The words or sentence that felt off…"
                    rows={2}
                    className="mt-3 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-base leading-6 text-white outline-none placeholder:text-white/25 focus:border-amber-200"
                  />
                  <textarea
                    value={issueInstead}
                    onChange={(event) => setIssueInstead(event.target.value)}
                    placeholder="What you said instead (optional)…"
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-base leading-6 text-white outline-none placeholder:text-white/25 focus:border-amber-200"
                  />
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      onClick={() => setReporting(false)}
                    >
                      Cancel
                    </Button>
                    <Button className="h-10 rounded-xl bg-amber-300 px-5 font-semibold text-ink hover:bg-amber-200" onClick={submitIssue}>
                      <Flag className="size-4" />Flag it
                    </Button>
                  </div>
                </div>
              )}

              {editing ? (
                <div className="space-y-3">
                  {[
                    { key: "context", label: "Context", rows: 3 },
                    { key: "recap", label: "Recap", rows: 3 },
                    { key: "script", label: current.responseGate ? "The Moment · If responses" : "The Moment", rows: 8 },
                    ...(current.responseGate || (draft.momentNoResponses ?? "").trim()
                      ? [{ key: "momentNoResponses", label: "The Moment · If no responses", rows: 6 }]
                      : []),
                    { key: "cta", label: "Call To Action", rows: 3 },
                    { key: "tease", label: "Tease ahead", rows: 2 },
                  ].map((field) => (
                    <label key={field.key} className="block rounded-[24px] border border-violet-300/25 bg-violet-400/[0.06] p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">{field.label}</span>
                      <textarea
                        value={draft[field.key] ?? ""}
                        onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, [field.key]: event.target.value }))}
                        rows={field.rows}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-lg leading-7 text-white outline-none focus:border-violet-300"
                      />
                    </label>
                  ))}
                  <div className="flex flex-wrap justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="h-11 rounded-xl border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button className="h-11 rounded-xl bg-white px-6 font-semibold text-ink hover:bg-white/90" onClick={saveEdits}>
                      <Check className="size-4" />Save changes
                    </Button>
                  </div>
                </div>
              ) : responseGateOpen ? (
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
                        <div className={`mt-3 ${step.textClassName}`}>{renderScript(step.text)}</div>
                      </div>
                    </div>
                  </section>
                  ))}
                </div>
              )}
            </article>

            {isLastItem && !studioResetConfirmed && (
              <div className="animate-pulse rounded-[22px] border-2 border-amber-300/60 bg-amber-300/[0.15] p-4">
                <p className="flex items-center gap-3 text-base font-bold text-amber-100">
                  <AlertTriangle className="size-5 shrink-0 text-amber-300" />
                  ZETTA: Live Assist back to AUTO after this link. Mic down. Channel 3 down.
                </p>
              </div>
            )}

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
            <GameScoreboard showId={workspace.showId} showDate={showDate} suggest={listeners.suggestNames} />

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
              <button
                type="button"
                onClick={() => setNamesOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-3 text-left"
                aria-expanded={namesOpen}
              >
                <span className="flex items-center gap-2">
                  <Star className="size-4 text-white/40" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Name log · players &amp; keepers</span>
                </span>
                <span className="flex items-center gap-2">
                  {listeners.entries.length > 0 && <Badge className="bg-white/10 text-white">{listeners.entries.length} name{listeners.entries.length === 1 ? "" : "s"}</Badge>}
                  <ChevronDown className={cn("size-4 text-white/40 transition-transform", namesOpen && "rotate-180")} />
                </span>
              </button>
              {namesOpen && (
                <>
              <div className="mt-4 inline-flex w-full rounded-xl border border-white/10 bg-black/20 p-1" role="group" aria-label="Message source">
                {listenerSources.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={source === option.value}
                    onClick={() => setSource(option.value)}
                    className={cn(
                      "min-h-9 flex-1 rounded-lg px-2 text-xs font-semibold transition-colors",
                      source === option.value ? "bg-white text-ink" : "text-white/45 hover:text-white"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="flex gap-2">
                  <Input
                    value={listenerName}
                    onChange={(event) => setListenerName(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") addListener() }}
                    placeholder="Add a name…"
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/25"
                  />
                  <Button className="h-11 rounded-xl bg-white px-3 text-ink hover:bg-white/90" onClick={() => addListener()} aria-label="Log listener message">
                    <Plus className="size-4" />
                  </Button>
                </div>
                {listeners.suggestNames(listenerName).length > 0 && (
                  <div className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-white/15 bg-[#14151d] shadow-2xl">
                    {listeners.suggestNames(listenerName).map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => addListener(name)}
                        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-sm font-semibold transition-colors hover:bg-white/10"
                      >
                        <span>{name}</span>
                        <span className="text-[10px] font-medium text-white/40">
                          {listeners.allTime[name.toLowerCase().replace(/\s+/g, " ").trim()] ?? 0} all time · tap to log
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {keeperNotice && <p className="mt-2 rounded-lg bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-200">{keeperNotice}</p>}
              <div className="mt-3 space-y-2">
                {listeners.entries.length ? listeners.entries.map((entry) => {
                  const allTime = listeners.allTime[entry.name.toLowerCase().replace(/\s+/g, " ").trim()]
                  const sourceSummary = Object.entries(entry.sourceCounts ?? {})
                    .map(([key, count]) => `${count} ${listenerSources.find((option) => option.value === key)?.label ?? key}`)
                    .join(" · ")
                  const latestNote = listeners.latestNoteFor(entry.name)
                  return (
                    <div key={entry.id} className="rounded-xl border border-white/10 bg-black/20 p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
                          <button
                            type="button"
                            onClick={() => listeners.logMessage(entry.name, source, -1)}
                            disabled={entry.messageCount <= 1}
                            className="grid size-9 place-items-center text-white/45 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-25"
                            aria-label={`Remove one message from ${entry.name}`}
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="grid min-w-8 place-items-center font-mono text-sm font-bold">{entry.messageCount}</span>
                          <button
                            type="button"
                            onClick={() => listeners.logMessage(entry.name, source)}
                            className="grid size-9 place-items-center text-white/70 transition-colors hover:bg-white hover:text-ink"
                            aria-label={`Another message from ${entry.name}`}
                            title="Tap when they message again"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{entry.name}</p>
                          <p className="truncate text-[10px] text-white/40">
                            {[sourceSummary, allTime && allTime > entry.messageCount ? `${allTime} all time` : ""].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setKeeperFor(keeperFor === entry.name ? "" : entry.name)
                            setKeeperText("")
                            setKeeperTag("keeper")
                          }}
                          aria-label={`Save something for ${entry.name}`}
                          title="Save a birthday, favourite song or keeper message"
                          className={cn(
                            "grid size-9 place-items-center rounded-lg transition-colors",
                            keeperFor === entry.name ? "bg-amber-300 text-ink" : "text-white/30 hover:bg-white/10 hover:text-amber-200"
                          )}
                        >
                          <Star className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => listeners.removeEntry(entry.id)}
                          aria-label={`Remove ${entry.name}`}
                          className="grid size-8 place-items-center rounded-lg text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      {latestNote && (
                        <p className={cn(
                          "mt-1.5 flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-[11px] leading-4",
                          latestNote.tag === "prayer" && !latestNote.followedUpAt
                            ? "bg-violet-400/15 text-violet-100"
                            : "bg-white/[0.05] text-white/55"
                        )}>
                          {latestNote.tag === "prayer" ? <HandHeart className="mt-0.5 size-3 shrink-0" /> : <Star className="mt-0.5 size-3 shrink-0" />}
                          <span className="min-w-0">
                            <span className="font-semibold">{latestNote.tag === "prayer" ? "Prayed for: " : latestNote.tag === "birthday" ? "Birthday: " : latestNote.tag === "favourite-song" ? "Favourite song: " : "Keeper: "}</span>
                            {latestNote.content}
                          </span>
                        </p>
                      )}
                      {keeperFor === entry.name && (
                        <div className="mt-2 space-y-2 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-2.5">
                          <div className="inline-flex w-full rounded-lg border border-white/10 bg-black/20 p-0.5">
                            {keeperTags.map((tag) => (
                              <button
                                key={tag.value}
                                type="button"
                                aria-pressed={keeperTag === tag.value}
                                onClick={() => setKeeperTag(tag.value)}
                                className={cn(
                                  "min-h-8 flex-1 rounded-md px-1.5 text-[10px] font-semibold transition-colors",
                                  keeperTag === tag.value ? "bg-amber-300 text-ink" : "text-white/45 hover:text-white"
                                )}
                              >
                                {tag.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={keeperText}
                              onChange={(event) => setKeeperText(event.target.value)}
                              onKeyDown={(event) => { if (event.key === "Enter") void saveKeeper() }}
                              placeholder={keeperTag === "birthday" ? "e.g. 14 March" : keeperTag === "favourite-song" ? "Song and artist" : "What did they send?"}
                              className="h-10 rounded-lg border-white/10 bg-black/25 text-sm text-white placeholder:text-white/25"
                            />
                            <Button size="sm" className="h-10 rounded-lg bg-amber-300 px-3 text-ink hover:bg-amber-200" onClick={() => void saveKeeper()}>
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }) : (
                  <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs leading-5 text-white/35">
                    Log the names that matter: game players, and anyone whose message is worth starring… prayer requests, birthdays, favourite songs. No need to count every message.
                  </p>
                )}
              </div>
              {listeners.totalMessages > 0 && (
                <p className="mt-3 text-right text-[10px] font-medium text-white/30">
                  {listeners.totalMessages} message{listeners.totalMessages === 1 ? "" : "s"} logged this show
                </p>
              )}
                </>
              )}
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
                {responseGateOpen ? "Choose YES or NO first" : markingDone ? "Done… moving" : isLastItem ? "Finish show" : "Mark done"}
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" disabled={!next} onClick={() => moveToItem(activeIndex + 1)}>Next<ArrowRight /></Button>
            </>
          ) : prompter === "countdown" ? (
            <Button
              variant="outline"
              className="mx-auto h-12 rounded-xl border-white/15 bg-white/5 px-8 text-white hover:bg-white/10 hover:text-white"
              onClick={stopPrompter}
            >
              <Square className="size-4" />Cancel… scrolling in {countdown}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={stopPrompter}
              >
                <Square className="size-4" />End reading
              </Button>
              <div className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => nudgePrompterSpeed(-0.25)}
                  aria-label="Scroll slower"
                  className="grid size-10 cursor-pointer place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-11 text-center font-mono text-sm font-bold text-white">{prompterSpeed}x</span>
                <button
                  type="button"
                  onClick={() => nudgePrompterSpeed(0.25)}
                  aria-label="Scroll faster"
                  className="grid size-10 cursor-pointer place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Plus className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={restartPrompter}
                  aria-label="Restart reading from the top"
                  className="grid size-10 cursor-pointer place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>
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
