"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { scopedKey } from "@/lib/user-scope"
import type { ParkedNote, ParkedSource, ParkedWhen } from "@/lib/parked-notes-shared"

/**
 * THE POCKET on the client (v2.40). Notes show straight away from this device,
 * every change is queued and sent to /api/parked, and the cloud copy wins on
 * each refresh. Signed out or offline, the queue waits and nothing is lost.
 */

const storageKey = "broadcastos-parked-notes"
const queueKey = "broadcastos-parked-queue"

type Pending = { kind: "upsert"; note: ParkedNote } | { kind: "delete"; id: string }

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(scopedKey(key))
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(scopedKey(key), JSON.stringify(value))
  } catch {
    // Storage can be unavailable in a private window; the in-memory copy still shows.
  }
}

function applyPending(notes: ParkedNote[], queue: Pending[]) {
  let next = notes
  for (const item of queue) {
    next = item.kind === "delete"
      ? next.filter((note) => note.id !== item.id)
      : [item.note, ...next.filter((note) => note.id !== item.note.id)]
  }
  return next
}

function sortNotes(notes: ParkedNote[]) {
  return [...notes].sort((a, b) => ((a.usedAt ? 1 : 0) - (b.usedAt ? 1 : 0)) || b.createdAt.localeCompare(a.createdAt))
}

async function sendPending(item: Pending) {
  const response = item.kind === "delete"
    ? await fetch(`/api/parked?id=${encodeURIComponent(item.id)}`, { method: "DELETE" })
    : await fetch("/api/parked", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: item.note }) })
  // A 4xx other than "signed out" means the server refused this item for good: drop it rather than block the queue.
  if (response.status >= 400 && response.status < 500 && response.status !== 401) return true
  return response.ok
}

/** Sends queued changes in order; stops at the first failure and keeps the rest for next time. */
async function flushQueue() {
  const queue = readJson<Pending[]>(queueKey, [])
  let index = 0
  while (index < queue.length) {
    try {
      if (!(await sendPending(queue[index]))) break
    } catch {
      break
    }
    index += 1
  }
  writeJson(queueKey, queue.slice(index))
  return index === queue.length
}

export type ParkedInput = {
  text: string
  source: ParkedSource
  sender?: string
  when: ParkedWhen
  showId: string
  showDate: string
}

export function useParkedNotes() {
  const [notes, setNotes] = useState<ParkedNote[]>([])
  const [online, setOnline] = useState<boolean | null>(null)
  const notesRef = useRef<ParkedNote[]>([])

  useEffect(() => {
    notesRef.current = notes
  }, [notes])

  const refresh = useCallback(async () => {
    await flushQueue()
    try {
      const response = await fetch("/api/parked", { cache: "no-store" })
      if (response.status === 401) {
        setOnline(false)
        return
      }
      const data = (await response.json().catch(() => null)) as { notes?: ParkedNote[] } | null
      if (response.ok && Array.isArray(data?.notes)) {
        const merged = sortNotes(applyPending(data.notes, readJson<Pending[]>(queueKey, [])))
        setNotes(merged)
        writeJson(storageKey, merged)
        setOnline(true)
        return
      }
    } catch {
      // Offline: the local copy stands.
    }
    setOnline(false)
  }, [])

  useEffect(() => {
    setNotes(sortNotes(applyPending(readJson<ParkedNote[]>(storageKey, []), readJson<Pending[]>(queueKey, []))))
    void refresh()
    const onFocus = () => { void refresh() }
    window.addEventListener("focus", onFocus)
    const interval = window.setInterval(onFocus, 60000)
    return () => {
      window.removeEventListener("focus", onFocus)
      window.clearInterval(interval)
    }
  }, [refresh])

  const commit = useCallback((next: ParkedNote[], pending: Pending) => {
    const sorted = sortNotes(next)
    notesRef.current = sorted
    setNotes(sorted)
    writeJson(storageKey, sorted)
    writeJson(queueKey, [...readJson<Pending[]>(queueKey, []), pending])
    void flushQueue().then((done) => { if (done) setOnline(true) })
  }, [])

  const add = useCallback((input: ParkedInput) => {
    const text = input.text.trim()
    if (!text) return null
    const note: ParkedNote = {
      id: crypto.randomUUID(),
      text,
      source: input.source,
      sender: (input.sender ?? "").trim(),
      when: input.when,
      showId: input.showId,
      showDate: input.showDate,
      createdAt: new Date().toISOString(),
      usedAt: null,
    }
    commit([note, ...notesRef.current], { kind: "upsert", note })
    return note
  }, [commit])

  const markUsed = useCallback((id: string, used = true) => {
    const next = notesRef.current.map((note) => (note.id === id ? { ...note, usedAt: used ? new Date().toISOString() : null } : note))
    const note = next.find((item) => item.id === id)
    if (!note) return
    commit(next, { kind: "upsert", note })
  }, [commit])

  const remove = useCallback((id: string) => {
    commit(notesRef.current.filter((note) => note.id !== id), { kind: "delete", id })
  }, [commit])

  const open = useMemo(() => notes.filter((note) => !note.usedAt), [notes])
  const used = useMemo(() => notes.filter((note) => Boolean(note.usedAt)), [notes])

  return { notes, open, used, add, markUsed, remove, refresh, online }
}
