"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ListenerMessage, MessageSource, Pronoun } from "@/lib/listener-messages-shared"

/** THE MESSAGE BANK on the client (v2.41): recent messages, paste one in, fix a read, tick it used. */

export type AddInput = { name: string; raw: string; source: MessageSource; pronoun?: Pronoun; showId: string; showDate: string }
export type AddResult = { message: ListenerMessage; readError: string | null }

export function useListenerMessages(options: { name?: string; auto?: boolean } = {}) {
  const [messages, setMessages] = useState<ListenerMessage[]>([])
  const [ai, setAi] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { name, auto = true } = options

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const query = name ? `?name=${encodeURIComponent(name)}` : "?limit=40"
      const response = await fetch(`/api/listener-messages${query}`, { cache: "no-store" })
      const data = (await response.json().catch(() => null)) as { messages?: ListenerMessage[]; ai?: boolean; error?: string } | null
      if (response.ok && Array.isArray(data?.messages)) {
        setMessages(data.messages)
        if (typeof data.ai === "boolean") setAi(data.ai)
        setError("")
      } else if (response.status === 401) {
        setError("Signed out on this device: sign in to use the message bank.")
      } else {
        setError(data?.error ?? "Could not load the message bank.")
      }
    } catch {
      setError("Could not reach the app.")
    } finally {
      setLoading(false)
    }
  }, [name])

  useEffect(() => {
    if (auto) void refresh()
  }, [auto, refresh])

  /** Banks the message and comes back with the read version (or a pending row when the app cannot write one yet). */
  const add = useCallback(async (input: AddInput) => {
    const response = await fetch("/api/listener-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const data = (await response.json().catch(() => null)) as { message?: ListenerMessage; ai?: boolean; readError?: string | null; error?: string } | null
    if (!response.ok || !data?.message) throw new Error(data?.error ?? "The message did not save.")
    if (typeof data.ai === "boolean") setAi(data.ai)
    setMessages((current) => [data.message!, ...current.filter((item) => item.id !== data.message!.id)])
    return { message: data.message, readError: data.readError ?? null }
  }, [])

  const patch = useCallback(async (id: string, body: { readVersion?: string; used?: boolean; rewrite?: boolean; pronoun?: Pronoun }) => {
    const response = await fetch("/api/listener-messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    })
    const data = (await response.json().catch(() => null)) as { message?: ListenerMessage; error?: string } | null
    if (!response.ok || !data?.message) throw new Error(data?.error ?? "The message did not update.")
    setMessages((current) => current.map((item) => (item.id === id ? data.message! : item)))
    return data.message
  }, [])

  const remove = useCallback(async (id: string) => {
    setMessages((current) => current.filter((item) => item.id !== id))
    await fetch(`/api/listener-messages?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {})
  }, [])

  return { messages, ai, loading, error, refresh, add, patch, remove }
}

function nameKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, " ").trim()
}

/** Everyone on the system, for the name box: profiles and every name ever logged. */
export function useKnownNames() {
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [listeners, profiles] = await Promise.all([
        fetch("/api/listeners", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null) as Promise<{ totals?: { name: string }[] } | null>,
        fetch("/api/listener-profiles", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null) as Promise<{ profiles?: { name: string }[] } | null>,
      ])
      if (cancelled) return
      const seen = new Map<string, string>()
      for (const candidate of [...(profiles?.profiles ?? []), ...(listeners?.totals ?? [])]) {
        const key = nameKey(candidate.name)
        if (key && !seen.has(key)) seen.set(key, candidate.name)
      }
      setNames([...seen.values()].sort((a, b) => a.localeCompare(b)))
    }
    void load()
    return () => { cancelled = true }
  }, [])

  return useMemo(() => ({
    names,
    has: (query: string) => { const key = nameKey(query); return Boolean(key) && names.some((name) => nameKey(name) === key) },
    suggest: (query: string) => {
      const key = nameKey(query)
      if (!key) return []
      const starts = names.filter((name) => nameKey(name).startsWith(key))
      const contains = names.filter((name) => !nameKey(name).startsWith(key) && nameKey(name).includes(key))
      return [...starts, ...contains].slice(0, 5)
    },
  }), [names])
}
