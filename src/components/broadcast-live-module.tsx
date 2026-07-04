"use client"

import { useState } from "react"
import { Check, MessageSquareText, Radio, Timer } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { ShowProfile } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function BroadcastLiveModule({ live }: { live: NonNullable<ShowProfile["broadcastLive"]> }) {
  const [checked, setChecked] = useState<string[]>([])

  function toggle(item: string) {
    setChecked((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])
  }

  return (
    <section className="overflow-hidden rounded-[24px] bg-neutral-950 text-white shadow-card">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="relative grid size-10 place-items-center rounded-xl bg-white/10">
            <Radio className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500" />
          </span>
          <div>
            <h2 className="font-semibold">BroadcastOS Live</h2>
            <p className="text-xs text-white/50">Clean view for the studio.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-mono text-xl font-semibold text-neutral-950">
          <Timer className="size-4" />{live.timer}
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.35fr_.8fr]">
        <div className="space-y-4 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <LiveCard label="Current link" value={live.currentLink} active />
            <LiveCard label="Next link" value={live.nextLink} />
          </div>
          <LiveCard label="Key CTA" value={live.keyCTA} />
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
              <MessageSquareText className="size-3.5" />Selected listener messages
            </p>
            <div className="mt-3 divide-y divide-white/10">
              {live.messages.map((message) => <p key={message} className="py-3 text-sm leading-5 text-white/80">{message}</p>)}
            </div>
          </div>
          <LiveCard label="Producer reminder" value={live.reminder} />
        </div>

        <div className="border-t border-white/10 bg-white/[0.03] p-6 lg:border-l lg:border-t-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">On-air checks</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {live.checks.map((item) => {
              const active = checked.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(item)}
                  className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors", active ? "border-white bg-white text-neutral-950" : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]")}
                >
                  <span className={cn("grid size-5 place-items-center rounded-md border", active ? "border-neutral-950 bg-neutral-950 text-white" : "border-white/20")}>
                    {active && <Check className="size-3" />}
                  </span>
                  {item}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function LiveCard({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-5", active ? "bg-white text-neutral-950" : "bg-white/[0.06]")}>
      <div className="flex items-center gap-2">
        <p className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", active ? "text-neutral-500" : "text-white/45")}>{label}</p>
        {active && <Badge className="bg-red-50 text-[9px] text-red-600 hover:bg-red-50">Now</Badge>}
      </div>
      <p className={cn("mt-3 text-sm font-medium leading-6", !active && "text-white/85")}>{value}</p>
    </div>
  )
}
