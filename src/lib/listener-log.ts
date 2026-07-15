"use client"

import { useCallback, useEffect, useState } from "react"

export type ListenerEntry = {
  id: string
  name: string
  showId: string
  showDate: string
  messageCount: number
  updatedAt: string
}

export type ListenerTotal = {
  name: string
  totalMessages: number
  showCount: number
  lastHeard: string
}

export type ListenerShowSummary = {
  showId: string
  showDate: string
  messages: number
  names: number
}

export function listenerNameKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, " ").trim()
}

function localKey(showId: string, showDate: string) {
  return `broadcastos-listeners:${showId}:${showDate || "undated"}`
}

function readLocal(showId: string, showDate: string): ListenerEntry[] {
  try {
    const raw = window.localStorage.getItem(localKey(showId, showDate))
    return raw ? (JSON.parse(raw) as ListenerEntry[]) : []
  } catch {
    return []
  }
}

function writeLocal(showId: string, showDate: string, entries: ListenerEntry[]) {
  window.localStorage.setItem(localKey(showId, showDate), JSON.stringify(entries))
}

/**
 * Today's listener roll for one show. Names live on this device instantly and
 * sync to the cloud in the background, so the roll survives a patchy studio
 * connection and still feeds the all-time Insights numbers.
 */
export function useListenerLog(showId: string, showDate: string) {
  const [entries, setEntries] = useState<ListenerEntry[]>([])
  const [allTime, setAllTime] = useState<Record<string, number>>({})

  useEffect(() => {
    setEntries(readLocal(showId, showDate))

    let cancelled = false
    async function pull() {
      try {
        const response = await fetch(`/api/listeners?showId=${encodeURIComponent(showId)}&showDate=${encodeURIComponent(showDate)}`, { cache: "no-store" })
        if (!response.ok) return
        const data = await response.json() as { entries?: ListenerEntry[]; totals?: ListenerTotal[] }
        if (cancelled) return

        if (Array.isArray(data.entries)) {
          setEntries((local) => {
            const merged = new Map<string, ListenerEntry>()
            for (const entry of [...local, ...data.entries!]) {
              const key = listenerNameKey(entry.name)
              const existing = merged.get(key)
              if (!existing || entry.messageCount > existing.messageCount) merged.set(key, entry)
            }
            const next = Array.from(merged.values()).sort((a, b) => b.messageCount - a.messageCount)
            writeLocal(showId, showDate, next)
            return next
          })
        }
        if (Array.isArray(data.totals)) {
          setAllTime(Object.fromEntries(data.totals.map((total) => [listenerNameKey(total.name), total.totalMessages])))
        }
      } catch {
        // Offline is fine: the local roll keeps working.
      }
    }
    void pull()
    return () => { cancelled = true }
  }, [showDate, showId])

  const logMessage = useCallback((rawName: string) => {
    const name = rawName.replace(/\s+/g, " ").trim()
    if (!name) return
    const key = listenerNameKey(name)

    setEntries((current) => {
      const existing = current.find((entry) => listenerNameKey(entry.name) === key)
      const next = existing
        ? current.map((entry) => entry === existing
          ? { ...entry, messageCount: entry.messageCount + 1, updatedAt: new Date().toISOString() }
          : entry)
        : [...current, {
          id: `listener-${Date.now()}`,
          name,
          showId,
          showDate,
          messageCount: 1,
          updatedAt: new Date().toISOString(),
        }]
      const sorted = next.sort((a, b) => b.messageCount - a.messageCount)
      writeLocal(showId, showDate, sorted)
      return [...sorted]
    })
    setAllTime((totals) => ({ ...totals, [key]: (totals[key] ?? 0) + 1 }))

    void fetch("/api/listeners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, showId, showDate }),
    }).catch(() => {})
  }, [showDate, showId])

  const removeEntry = useCallback((id: string) => {
    setEntries((current) => {
      const target = current.find((entry) => entry.id === id)
      const next = current.filter((entry) => entry.id !== id)
      writeLocal(showId, showDate, next)
      if (target) {
        void fetch(`/api/listeners?showId=${encodeURIComponent(showId)}&showDate=${encodeURIComponent(showDate)}&name=${encodeURIComponent(target.name)}`, {
          method: "DELETE",
        }).catch(() => {})
      }
      return next
    })
  }, [showDate, showId])

  const totalMessages = entries.reduce((sum, entry) => sum + entry.messageCount, 0)

  return { entries, allTime, totalMessages, logMessage, removeEntry }
}
