"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Radio, Sparkles } from "lucide-react"

import { broadcastOSVersion } from "@/lib/version"
import { cn } from "@/lib/utils"

export function AppSplashScreen() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const storageKey = `broadcastos-splash-${broadcastOSVersion.code}`
    const alreadySeen = window.sessionStorage.getItem(storageKey)

    if (alreadySeen) return

    setVisible(true)
    const leaveTimer = window.setTimeout(() => setLeaving(true), 1550)
    const hideTimer = window.setTimeout(() => {
      window.sessionStorage.setItem(storageKey, "seen")
      setVisible(false)
    }, 2150)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#08090d] text-white transition-all duration-700",
        leaving && "pointer-events-none scale-[1.025] opacity-0 blur-sm"
      )}
      aria-label={`${broadcastOSVersion.label} loading`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_12%,rgba(237,27,152,.24),transparent_30rem),radial-gradient(circle_at_22%_80%,rgba(42,59,172,.32),transparent_34rem)]" />
      <div className="studio-ambient" />
      <div className="studio-scanline" />

      <div className="relative mx-auto w-full max-w-3xl px-6 text-center">
        <div className="mx-auto grid size-28 place-items-center rounded-[2rem] border border-white/10 bg-white shadow-[0_24px_90px_rgba(237,27,152,.22)]">
          <Image src="/premier-logo.svg" alt="Premier" width={126} height={59} priority className="w-[86px]" />
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.065] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          <span className="studio-live-dot" />
          Studio system starting
        </div>

        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.07em] sm:text-7xl">
          BroadcastOS
        </h1>
        <p className="mt-3 text-base font-medium text-white/58 sm:text-lg">
          {broadcastOSVersion.name}
        </p>

        <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
          {["Producer Desk", "Response Gate", "On Air"].map((item, index) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="mx-auto mb-3 grid size-8 place-items-center rounded-xl bg-white/10">
                {index === 1 ? <Sparkles className="size-4 text-fuchsia-200" /> : <Radio className="size-4 text-violet-200" />}
              </div>
              <p className="text-xs font-semibold text-white/75">{item}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 h-2 max-w-sm overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-[broadcastos-splash-load_1.55s_ease-out_forwards] rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-200" />
        </div>

        <p className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-white/35">
          {broadcastOSVersion.label} · {broadcastOSVersion.date}
        </p>
      </div>
    </div>
  )
}
