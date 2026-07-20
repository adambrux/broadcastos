"use client"

import { useCallback, useEffect, useState } from "react"

export type ListenerSource = "whatsapp" | "instagram" | "text"

export const listenerSources: { value: ListenerSource; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "text", label: "Text" },
]

export type ListenerEntry = {
  id: string
  name: string
  showId: string
  showDate: string
  messageCount: number
  sourceCounts?: Record<string, number>
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

export type ListenerNote = {
  id: string
  nameKey: string
  tag: string
  content: string
  showDate: string
  followedUpAt: string
  createdAt: string
}

export type ListenerProfile = {
  nameKey: string
  name: string
  birthday: string
  favouriteSong: string
  lastCheckinAt: string
}

export type MiaListener = {
  name: string
  nameKey: string
  daysQuiet: number
  lastHeard: string
  totalMessages: number
}

const dayMs = 24 * 60 * 60 * 1000

function daysSince(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  if (Number.isNaN(date.getTime())) return 0
  return Math.floor((Date.now() - date.getTime()) / dayMs)
}

/**
 * Missing in action: family not heard from in over a week. A personal check-in
 * clears them; if they stay silent, they gently resurface a fortnight later so
 * nobody slips away unnoticed.
 */
export function computeMia(totals: ListenerTotal[], profiles: ListenerProfile[]): MiaListener[] {
  return totals
    .map((total) => {
      const key = listenerNameKey(total.name)
      const profile = profiles.find((item) => item.nameKey === key)
      const daysQuiet = daysSince(total.lastHeard)
      const checkinDays = profile?.lastCheckinAt ? daysSince(profile.lastCheckinAt) : null
      const checkedInSinceQuiet = checkinDays !== null && checkinDays < daysQuiet
      const needsCare = daysQuiet > 7 && (!checkedInSinceQuiet || (checkinDays !== null && checkinDays > 14))
      return needsCare ? { name: total.name, nameKey: key, daysQuiet, lastHeard: total.lastHeard, totalMessages: total.totalMessages } : null
    })
    .filter((item): item is MiaListener => item !== null)
    .sort((a, b) => b.daysQuiet - a.daysQuiet)
}

/** Pastoral care state: the MIA list and prayer requests awaiting offline follow-up. */
export function usePastoralCare() {
  const [totals, setTotals] = useState<ListenerTotal[]>([])
  const [profiles, setProfiles] = useState<ListenerProfile[]>([])
  const [notes, setNotes] = useState<ListenerNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [listeners, profileData] = await Promise.all([
          fetch("/api/listeners", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).catch(() => null),
          fetch("/api/listener-profiles", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).catch(() => null),
        ])
        if (cancelled) return
        if (listeners?.totals) setTotals(listeners.totals)
        if (profileData) {
          setProfiles(profileData.profiles ?? [])
          setNotes(profileData.notes ?? [])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const checkIn = useCallback(async (name: string) => {
    setProfiles((current) => {
      const key = listenerNameKey(name)
      const existing = current.find((item) => item.nameKey === key)
      const nowIso = new Date().toISOString()
      return existing
        ? current.map((item) => item.nameKey === key ? { ...item, lastCheckinAt: nowIso } : item)
        : [...current, { nameKey: key, name, birthday: "", favouriteSong: "", lastCheckinAt: nowIso }]
    })
    await fetch("/api/listener-profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, checkin: true }),
    }).catch(() => {})
  }, [])

  const markFollowedUp = useCallback(async (noteId: string) => {
    setNotes((current) => current.map((note) => note.id === noteId ? { ...note, followedUpAt: new Date().toISOString() } : note))
    await fetch("/api/listener-profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, followedUp: true }),
    }).catch(() => {})
  }, [])

  const mia = computeMia(totals, profiles)
  const prayerFollowUps = notes.filter((note) => note.tag === "prayer" && !note.followedUpAt)
  const nameFor = useCallback((nameKey: string) => {
    return profiles.find((item) => item.nameKey === nameKey)?.name
      ?? totals.find((total) => listenerNameKey(total.name) === nameKey)?.name
      ?? nameKey
  }, [profiles, totals])

  return { loading, mia, prayerFollowUps, checkIn, markFollowedUp, nameFor }
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

function bumpSource(counts: Record<string, number> | undefined, source: ListenerSource) {
  return { ...(counts ?? {}), [source]: ((counts ?? {})[source] ?? 0) + 1 }
}

/**
 * Today's listener roll for one show. Names live on this device instantly and
 * sync to the cloud in the background, so the roll survives a patchy studio
 * connection and still feeds the all-time Insights numbers.
 */
export function useListenerLog(showId: string, showDate: string) {
  const [entries, setEntries] = useState<ListenerEntry[]>([])
  const [totals, setTotals] = useState<ListenerTotal[]>([])

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
        if (Array.isArray(data.totals)) setTotals(data.totals)
      } catch {
        // Offline is fine: the local roll keeps working.
      }
    }
    void pull()
    return () => { cancelled = true }
  }, [showDate, showId])

  const logMessage = useCallback((rawName: string, source: ListenerSource = "whatsapp") => {
    const name = rawName.replace(/\s+/g, " ").trim()
    if (!name) return
    const key = listenerNameKey(name)

    setEntries((current) => {
      const existing = current.find((entry) => listenerNameKey(entry.name) === key)
      const next = existing
        ? current.map((entry) => entry === existing
          ? { ...entry, messageCount: entry.messageCount + 1, sourceCounts: bumpSource(entry.sourceCounts, source), updatedAt: new Date().toISOString() }
          : entry)
        : [...current, {
          id: `listener-${Date.now()}`,
          name,
          showId,
          showDate,
          messageCount: 1,
          sourceCounts: { [source]: 1 },
          updatedAt: new Date().toISOString(),
        }]
      const sorted = next.sort((a, b) => b.messageCount - a.messageCount)
      writeLocal(showId, showDate, sorted)
      return [...sorted]
    })
    setTotals((current) => {
      const existing = current.find((total) => listenerNameKey(total.name) === key)
      if (!existing) return [...current, { name, totalMessages: 1, showCount: 1, lastHeard: showDate }]
      return current.map((total) => total === existing
        ? { ...total, totalMessages: total.totalMessages + 1, lastHeard: showDate }
        : total)
    })

    void fetch("/api/listeners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, showId, showDate, source }),
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

  const saveKeeper = useCallback(async (name: string, tag: string, content: string) => {
    const response = await fetch("/api/listener-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, note: { tag, content, showDate } }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null
      throw new Error(data?.error ?? "Could not save that yet.")
    }
  }, [showDate])

  /** Names to suggest while typing: all-time regulars plus today's roll. */
  const suggestNames = useCallback((query: string) => {
    const needle = listenerNameKey(query)
    if (!needle) return []
    const seen = new Set<string>()
    const names: string[] = []
    for (const candidate of [...entries.map((entry) => entry.name), ...totals.map((total) => total.name)]) {
      const key = listenerNameKey(candidate)
      if (seen.has(key) || key === needle || !key.includes(needle)) continue
      seen.add(key)
      names.push(candidate)
      if (names.length >= 4) break
    }
    return names
  }, [entries, totals])

  const allTime = Object.fromEntries(totals.map((total) => [listenerNameKey(total.name), total.totalMessages]))
  const totalMessages = entries.reduce((sum, entry) => sum + entry.messageCount, 0)

  return { entries, totals, allTime, totalMessages, logMessage, removeEntry, saveKeeper, suggestNames }
}
