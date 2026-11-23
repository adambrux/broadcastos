"use client"

import { useCallback, useEffect, useState } from "react"
import { Cable } from "lucide-react"
import { cn } from "@/lib/utils"

type LastReceived = { id: string; title: string; showId: string; showDate: string; receivedAt: string }
type LineState = "checking" | "connected" | "off" | "unreachable"

function whenLabel(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })
  } catch {
    return iso
  }
}

const labels: Record<LineState, string> = {
  checking: "Producer line · checking",
  connected: "Producer line · connected",
  off: "Producer line · not switched on",
  unreachable: "Producer line · can't reach the app",
}

/**
 * Is the producer's line into BroadcastOS up, and when did a plan last arrive
 * through it? Checks on load, on focus and every minute; tap to check now.
 */
export function ProducerLineBadge({ dark = false, className }: { dark?: boolean; className?: string }) {
  const [state, setState] = useState<LineState>("checking")
  const [last, setLast] = useState<LastReceived | null>(null)

  const check = useCallback(async () => {
    try {
      const response = await fetch("/api/inbox/show-plan", { cache: "no-store" })
      const data = (await response.json().catch(() => null)) as { inbox?: boolean; lastReceived?: LastReceived | null } | null
      if (!response.ok || !data) {
        setState("unreachable")
        return
      }
      setState(data.inbox ? "connected" : "off")
      setLast(data.lastReceived ?? null)
    } catch {
      setState("unreachable")
    }
  }, [])

  useEffect(() => {
    void check()
    const onFocus = () => { void check() }
    window.addEventListener("focus", onFocus)
    const interval = window.setInterval(onFocus, 60000)
    return () => {
      window.removeEventListener("focus", onFocus)
      window.clearInterval(interval)
    }
  }, [check])

  const dot = state === "connected" ? "bg-emerald-400" : state === "checking" ? "bg-white/40" : "bg-amber-400"
  const detail = last ? `Last plan in: ${last.title} · ${whenLabel(last.receivedAt)}` : "No plan has arrived this way yet"

  return (
    <button
      type="button"
      onClick={() => { setState("checking"); void check() }}
      title="Tap to check the line now"
      className={cn(
        "inline-flex max-w-full flex-col items-start gap-1 rounded-2xl border px-3 py-2 text-left transition-colors",
        dark ? "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]" : "border-border/70 bg-muted/40 text-foreground hover:bg-muted/70",
        className
      )}
    >
      <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
        <Cable className={cn("size-3.5", dark ? "text-white/50" : "text-muted-foreground")} />
        <span className={cn("size-2 rounded-full", dot, state === "connected" && "shadow-[0_0_0_3px_rgba(52,211,153,.25)]")} aria-hidden="true" />
        {labels[state]}
      </span>
      <span className={cn("text-[11px] leading-4", dark ? "text-white/55" : "text-muted-foreground")}>{detail}</span>
    </button>
  )
}
