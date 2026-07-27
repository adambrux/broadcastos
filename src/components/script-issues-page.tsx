"use client"

import { useEffect, useState } from "react"
import { Check, ClipboardCopy, Flag, RotateCcw, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  buildScriptIssuesReport,
  removeScriptIssue,
  syncScriptIssues,
  updateScriptIssue,
  useScriptIssues,
  type ScriptIssue,
} from "@/lib/script-issues"
import { studioShows, type StudioShowId } from "@/lib/studio-workspace"
import { cn } from "@/lib/utils"

function showName(showId: string) {
  return (studioShows as Record<string, { name: string }>)[showId as StudioShowId]?.name ?? showId
}

function IssueCard({ issue }: { issue: ScriptIssue }) {
  const [flaggedText, setFlaggedText] = useState(issue.flaggedText)
  const [saidInstead, setSaidInstead] = useState(issue.saidInstead)
  const dirty = flaggedText !== issue.flaggedText || saidInstead !== issue.saidInstead
  const resolved = Boolean(issue.resolvedAt)

  return (
    <article className={cn("rounded-2xl border bg-card p-5 shadow-sm", resolved ? "border-border/60 opacity-70" : "border-border")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={resolved ? "bg-muted text-muted-foreground" : "bg-amber-100 text-amber-900"}>
              <Flag className="size-3" />{resolved ? "Sorted" : "Open"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {[showName(issue.showId), issue.showDate, issue.hour, issue.linkPosition].filter(Boolean).join(" · ")}
            </span>
          </div>
          <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">{issue.linkTitle}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg"
            onClick={() => updateScriptIssue(issue.id, { resolvedAt: resolved ? "" : new Date().toISOString() })}
          >
            {resolved ? <><RotateCcw className="size-3.5" />Reopen</> : <><Check className="size-3.5" />Mark sorted</>}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg text-destructive hover:text-destructive"
            aria-label="Delete this issue"
            onClick={() => removeScriptIssue(issue.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">What didn&apos;t sound like me</span>
          <textarea
            value={flaggedText}
            onChange={(event) => setFlaggedText(event.target.value)}
            placeholder="The words or sentence that felt off…"
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-sm leading-6 outline-none focus:border-brand-indigo"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">What I said instead</span>
          <textarea
            value={saidInstead}
            onChange={(event) => setSaidInstead(event.target.value)}
            placeholder="Your version, in your words…"
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-sm leading-6 outline-none focus:border-brand-indigo"
          />
        </label>
      </div>
      {dirty && (
        <div className="mt-3 flex justify-end">
          <Button size="sm" className="h-9 rounded-lg" onClick={() => updateScriptIssue(issue.id, { flaggedText, saidInstead })}>
            <Check className="size-3.5" />Save changes
          </Button>
        </div>
      )}
    </article>
  )
}

export function ScriptIssuesPage() {
  const issues = useScriptIssues()
  const [copied, setCopied] = useState(false)
  const openIssues = issues.filter((issue) => !issue.resolvedAt)
  const sortedIssues = issues.filter((issue) => issue.resolvedAt)

  useEffect(() => {
    void syncScriptIssues()
  }, [])

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(buildScriptIssuesReport(issues))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard can be blocked: the report stays visible on the page either way.
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Presenter feedback</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">Script issues</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Everything you flagged on air lands here. Add what you said instead when you have a minute, then copy the report and paste it into the producer chat… each flag becomes a permanent voice rule.
          </p>
        </div>
        <Button className="h-11 rounded-xl" onClick={() => void copyReport()} disabled={!openIssues.length}>
          {copied ? <><Check className="size-4" />Copied</> : <><ClipboardCopy className="size-4" />Copy report</>}
        </Button>
      </header>

      {openIssues.length ? (
        <section className="space-y-4">
          {openIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Flag className="mx-auto size-8 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">Nothing flagged right now</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            When something in a script doesn&apos;t sound like you, tap the flag on that link in On Air and it lands here.
          </p>
        </section>
      )}

      {sortedIssues.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Sorted</h2>
          {sortedIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </section>
      )}
    </div>
  )
}
