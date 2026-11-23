"use client"

import { useCallback, useEffect, useState } from "react"
import type { ListenerMessage, MessageSource, Pronoun } from "@/lib/listener-messages-shared"

/** THE MESSAGE BANK on the client (v2.41): recent messages, paste one in, fix a read, tick it used. */

type AddInput = { name: string; raw: string; source: MessageSource; pronoun?: Pronoun; showId: string; showDate: string }

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
