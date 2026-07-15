"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Radio, SlidersHorizontal, X } from "lucide-react"

import { broadcastOSVersion } from "@/lib/version"
import { cn } from "@/lib/utils"

const openEventName = "broadcastos-open-splash"

/** Re-opens the splash navigation from anywhere (the Premier logo uses this). */
export function openAppSplash() {
  window.dispatchEvent(new Event(openEventName))
}

export function AppSplashScreen() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const storageKey = `broadcastos-splash-${broadcastOSVersion.code}`
    if (!window.sessionStorage.getItem(storageKey)) setVisible(true)

    const reopen = () => {
      setLeaving(false)
      setVisible(true)
    }
    window.addEventListener(openEventName, reopen)
    return () => window.removeEventListener(openEventName, reopen)
  }, [])

  function close(destination?: string) {
    if (leaving) return
    window.sessionStorage.setItem(`broadcastos-splash-${broadcastOSVersion.code}`, "seen")
    setLeaving(true)
    if (destination) router.push(destination)
    window.setTimeout(() => {
      setVisible(false)
      setLeaving(false)
    }, 550)
  }

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#08090d] text-white transition-all duration-500",
        leaving && "pointer-events-none scale-[1.02] opacity-0 blur-sm"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="BroadcastOS"
      onKeyDown={(event) => { if (event.key === "Escape") close() }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_12%,rgba(237,27,152,.24),transparent_30rem),radial-gradient(circle_at_22%_80%,rgba(42,59,172,.32),transparent_34rem)]" />
      <div className="studio-ambient" />
      <div className="studio-scanline" />

      <button
        type="button"
        onClick={() => close()}
        aria-label="Close"
        className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/70 transition-colors hover:bg-white/[0.14] hover:text-white"
      >
        <X className="size-5" />
      </button>

      <div className="relative mx-auto w-full max-w-3xl px-6 py-10 text-center">
        <div className="mx-auto grid size-24 place-items-center rounded-[1.8rem] border border-white/10 bg-white shadow-[0_24px_90px_rgba(237,27,152,.22)]">
          <Image src="/premier-logo.svg" alt="Premier" width={126} height={59} priority className="w-[76px]" />
        </div>

        <h1 className="mt-7 text-5xl font-semibold tracking-[-0.07em] sm:text-6xl">BroadcastOS</h1>
        <p className="mt-3 text-base font-medium text-white/55">Where do you want to go?</p>

        <div className="mx-auto mt-9 grid max-w-2xl gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => close("/producer")}
            className="group rounded-[28px] border border-white/12 bg-white/[0.055] p-7 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-violet-400/[0.12]"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-violet-200 transition-colors group-hover:bg-white group-hover:text-ink">
              <SlidersHorizontal className="size-5" />
            </span>
            <span className="mt-5 block text-2xl font-semibold tracking-[-0.03em]">Produce</span>
            <span className="mt-2 block text-sm leading-6 text-white/50">Plan the show, import the script and get everything ready.</span>
          </button>

          <button
            type="button"
            onClick={() => close("/broadcast")}
            className="group rounded-[28px] border border-white/12 bg-white p-7 text-left text-ink transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(237,27,152,.3)]"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-ink text-white">
              <Radio className="size-5" />
            </span>
            <span className="mt-5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.03em]">
              Go On Air
              <span className="studio-live-dot" aria-hidden="true" />
            </span>
            <span className="mt-2 block text-sm leading-6 text-ink/60">Open the saved script and read the show from the screen.</span>
          </button>
        </div>

        <p className="mt-9 font-mono text-xs uppercase tracking-[0.2em] text-white/30">
          {broadcastOSVersion.label} · {broadcastOSVersion.date}
        </p>
      </div>
    </div>
  )
}
