"use client"

import { useSyncExternalStore } from "react"

import { studioShows, type StudioShowId } from "@/lib/studio-workspace"
import { scopedKey } from "@/lib/user-scope"

export type ScriptIssue = {
  id: string
  showId: string
  showDate: string
  linkTitle: string
  hour: string
  linkPosition: string
  flaggedText: string
  saidInstead: string
  resolvedAt: string
  createdAt: string
  updatedAt: string
}

const storageKey = "broadcastos-script-issues-v1"
const eventName = "broadcastos-script-issues-change"

function readLocal(): ScriptIssue[] {
  try {
    const raw = window.localStorage.getItem(scopedKey(storageKey))
    return raw ? (JSON.parse(raw) as ScriptIssue[]) : []
  } catch {
    return []
  }
}

function writeLocal(issues: ScriptIssue[]) {
  window.localStorage.setItem(scopedKey(storageKey), JSON.stringify(issues))
  window.dispatchEvent(new Event(eventName))
}

function sortIssues(issues: ScriptIssue[]) {
  return [...issues].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function mergeIssues(local: ScriptIssue[], remote: ScriptIssue[]) {
  const merged = new Map<string, ScriptIssue>()
  for (const issue of [...remote, ...local]) {
    const existing = merged.get(issue.id)
    if (!existing || issue.updatedAt > existing.updatedAt) merged.set(issue.id, issue)
  }
  return sortIssues(Array.from(merged.values()))
}

function pushToCloud(issue: ScriptIssue) {
  void fetch("/api/script-issues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(issue),
  }).catch(() => {})
}

/** Flag a link from On Air. Local instantly, cloud in the background. */
export function reportScriptIssue(issue: Omit<ScriptIssue, "id" | "resolvedAt" | "createdAt" | "updatedAt">): ScriptIssue {
  const now = new Date().toISOString()
  const record: ScriptIssue = { ...issue, id: `issue-${Date.now()}`, resolvedAt: "", createdAt: now, updatedAt: now }
  writeLocal(sortIssues([record, ...readLocal()]))
  pushToCloud(record)
  return record
}

export function updateScriptIssue(id: string, changes: Partial<Pick<ScriptIssue, "flaggedText" | "saidInstead" | "resolvedAt">>) {
  const next = readLocal().map((issue) =>
    issue.id === id ? { ...issue, ...changes, updatedAt: new Date().toISOString() } : issue
  )
  writeLocal(next)
  const updated = next.find((issue) => issue.id === id)
  if (updated) pushToCloud(updated)
}

export function removeScriptIssue(id: string) {
  writeLocal(readLocal().filter((issue) => issue.id !== id))
  void fetch(`/api/script-issues?issueId=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {})
}

/** Pull cloud copies and fold them into the local list (newest edit wins). */
export async function syncScriptIssues() {
  try {
    const response = await fetch("/api/script-issues", { cache: "no-store" })
    if (!response.ok) return
    const data = (await response.json()) as { issues?: ScriptIssue[] }
    if (Array.isArray(data.issues)) writeLocal(mergeIssues(readLocal(), data.issues))
  } catch {
    // Offline is fine: the local list keeps working.
  }
}

const emptySnapshot = "[]"

function getSnapshot() {
  return window.localStorage.getItem(scopedKey(storageKey)) ?? emptySnapshot
}

function subscribe(listener: () => void) {
  const notify = () => listener()
  window.addEventListener(eventName, notify)
  window.addEventListener("storage", notify)
  return () => {
    window.removeEventListener(eventName, notify)
    window.removeEventListener("storage", notify)
  }
}

export function useScriptIssues() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot)
  return sortIssues(JSON.parse(snapshot) as ScriptIssue[])
}

function formatShowLine(issue: ScriptIssue) {
  const show = (studioShows as Record<string, { name: string }>)[issue.showId as StudioShowId]?.name ?? issue.showId
  return [show, issue.showDate, [issue.hour, issue.linkPosition].filter(Boolean).join(" · ")].filter(Boolean).join(" · ")
}

/** Plain-text summary of open issues, written to paste straight into a debrief chat. */
export function buildScriptIssuesReport(issues: ScriptIssue[]) {
  const open = issues.filter((issue) => !issue.resolvedAt)
  if (!open.length) return "Script issues report: nothing open right now."

  const lines: string[] = [`Script issues report (${open.length} open):`, ""]
  open.forEach((issue, index) => {
    lines.push(`${index + 1}. ${issue.linkTitle} — ${formatShowLine(issue)}`)
    lines.push(issue.flaggedText.trim() ? `   Didn't sound like me: "${issue.flaggedText.trim()}"` : "   Didn't sound like me: (whole link flagged, no words captured)")
    if (issue.saidInstead.trim()) lines.push(`   What I said instead: "${issue.saidInstead.trim()}"`)
    lines.push("")
  })
  return lines.join("\n").trim()
}
