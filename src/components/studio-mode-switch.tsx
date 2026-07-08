"use client"

import { Building2, House, MessageSquareText, Radio } from "lucide-react"

import { saveStudioWorkspace, useStudioWorkspace, type StudioMode } from "@/lib/studio-workspace"
import { cn } from "@/lib/utils"

const modes = [
  {
    id: "in-studio" as const,
    label: "In-studio companion",
    shortLabel: "In studio",
    description: "Planning, links and On Air only. Zetta and WhatsApp stay on the studio systems.",
    icon: Building2,
  },
  {
    id: "remote" as const,
    label: "Remote production",
    shortLabel: "Remote",
    description: "Full show planning with manually pasted WhatsApp messages and remote production notes.",
    icon: House,
  },
]

export function StudioModeSwitch({
  dark = false,
  compact = false,
}: {
  dark?: boolean
  compact?: boolean
}) {
  const workspace = useStudioWorkspace()

  function selectMode(mode: StudioMode) {
    saveStudioWorkspace({ ...workspace, mode })
  }

  if (compact) {
    return (
      <div className={cn("inline-flex rounded-xl border p-1", dark ? "border-white/10 bg-white/5" : "bg-white")}>
        {modes.map(({ id, shortLabel, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={workspace.mode === id}
            onClick={() => selectMode(id)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-semibold transition-colors",
              dark ? "text-white/45" : "text-muted-foreground",
              workspace.mode === id && (dark ? "bg-white text-ink" : "bg-ink text-white")
            )}
          >
            <Icon className="size-3" />{shortLabel}
          </button>
        ))}
      </div>
    )
  }

  return (
    <section className={cn(
      "rounded-[24px] border p-4 shadow-sm sm:p-5",
      dark ? "border-white/10 bg-white/[0.045] text-white shadow-none" : "bg-white"
    )}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 lg:w-[220px]">
          <p className={cn("text-[10px] font-semibold uppercase tracking-[0.15em]", dark ? "text-fuchsia-300" : "text-brand-indigo")}>How are you working?</p>
          <p className={cn("mt-1 text-xs", dark ? "text-white/45" : "text-muted-foreground")}>This changes which tools BroadcastOS shows.</p>
        </div>
        <div className="grid flex-1 gap-2 md:grid-cols-2">
          {modes.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={workspace.mode === id}
              onClick={() => selectMode(id)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                dark ? "border-white/10 bg-black/15" : "bg-white",
                workspace.mode === id && (dark ? "border-fuchsia-300/35 bg-fuchsia-300/[0.08]" : "border-brand-indigo/25 bg-brand-soft/40 ring-2 ring-brand-indigo/10")
              )}
            >
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", dark ? "bg-white/10 text-fuchsia-300" : "bg-brand-soft text-brand-indigo")}>
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className={cn("mt-1 block text-[11px] leading-5", dark ? "text-white/45" : "text-muted-foreground")}>{description}</span>
                <span className={cn("mt-2 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em]", workspace.mode === id ? (dark ? "text-fuchsia-300" : "text-brand-indigo") : "text-muted-foreground")}>
                  {id === "remote" ? <MessageSquareText className="size-3" /> : <Radio className="size-3" />}
                  {workspace.mode === id ? "Active mode" : "Switch mode"}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
