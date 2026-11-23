"use client"

import { useState } from "react"
import { Archive, Check, ChevronDown, Copy, Loader2, MessageCircle, Pencil, RotateCcw, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useListenerMessages } from "@/lib/listener-messages"
import { messageSourceLabels, messageSources, type ListenerMessage, type MessageSource } from "@/lib/listener-messages-shared"
import { useParkedNotes } from "@/lib/parked-notes"
import { cn } from "@/lib/utils"

/**
 * THE MESSAGE BANK (v2.41). Paste a WhatsApp, name the person, bank it: the
 * app writes the on-air read ("Sam says…", her words kept where the line is
 * good), the message is saved against her, and the read can go into a link,
 * into the Pocket for later, or straight to the clipboard.
 */

function timeLabel(iso: string) {
  try {
    const date = new Date(iso)
    const sameDay = date.toDateString() === new Date().toDateString()
    return date.toLocaleString("en-GB", sameDay
      ? { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }
      : { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" })
  } catch {
    return ""
  }
}

type CardActions = {
  saveRead: (id: string, readVersion: string) => Promise<void>
  markUsed: (id: string, used: boolean) => Promise<void>
  remove: (id: string) => Promise<void>
  copy: (text: string) => Promise<void>
  pocket: (message: ListenerMessage) => void
  dropIntoLink?: (message: ListenerMessage) => void
}

const outlineDark = "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"

function MessageCard({ message, dark, actions }: { message: ListenerMessage; dark: boolean; actions: CardActions }) {
  const [editing, setEditing] = useState(message.readStatus !== "ready")
  const [draft, setDraft] = useState(message.readVersion ?? "")
  const [showRaw, setShowRaw] = useState(false)
  const [saving, setSaving] = useState(false)
  const used = Boolean(message.usedAt)
  const readText = message.readVersion ?? ""
  const copyText = readText || message.raw

  async function save() {
    if (!draft.trim()) return
    setSaving(true)
    try {
      await actions.saveRead(message.id, draft.trim())
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const field = cn(
    "w-full rounded-xl border px-3 py-2.5 text-sm leading-6 outline-none",
    dark ? "border-white/10 bg-black/25 text-white placeholder:text-white/30 focus:border-white/30" : "border-input bg-white placeholder:text-muted-foreground focus:border-ring"
  )

  return (
    <div className={cn("rounded-2xl border p-3", dark ? "border-white/10 bg-black/20" : "border-border/70 bg-white", used && "opacity-70")}>
      <div className="flex flex-wrap items-center gap-2">
        <p className={cn("text-sm font-semibold", dark ? "text-white" : "text-foreground")}>{message.name}</p>
        <Badge variant="outline" className={cn("text-[9px]", dark && "border-white/20 text-white/70")}>{messageSourceLabels[message.source]}</Badge>
        <span className={cn("text-[11px]", dark ? "text-white/40" : "text-muted-foreground")}>{timeLabel(message.createdAt)}</span>
        {used && <Badge className={cn("text-[9px]", dark ? "bg-emerald-400/20 text-emerald-100" : "bg-success-soft text-success")}><Check />Used</Badge>}
        {message.readStatus !== "ready" && !editing && <Badge className="bg-amber-100 text-[9px] text-amber-800">Needs a read version</Badge>}
      </div>

      {editing ? (
        <div className="mt-2 space-y-2">
          {message.readStatus !== "ready" && (
            <p className={cn("text-[11px]", dark ? "text-amber-200/80" : "text-amber-700")}>No read version yet. Write it here in the third person, or leave it for the producer.</p>
          )}
          <textarea rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`${message.name.split(" ")[0]} says…`} className={cn(field, "resize-y")} />
          <div className="flex gap-1.5">
            <Button size="sm" className={cn("h-8 rounded-lg", dark ? "bg-white text-ink hover:bg-white/90" : "bg-ink text-white hover:bg-ink/90")} onClick={() => void save()} disabled={saving || !draft.trim()}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}Save the read
            </Button>
            {message.readStatus === "ready" && (
              <Button size="sm" variant="ghost" className={cn("h-8 rounded-lg", dark && "text-white/60 hover:bg-white/10 hover:text-white")} onClick={() => { setDraft(readText); setEditing(false) }}>Cancel</Button>
            )}
          </div>
        </div>
      ) : (
        <p className={cn("mt-2 whitespace-pre-line text-[15px] font-medium leading-6", dark ? "text-white/90" : "text-foreground")}>{readText}</p>
      )}

      <button type="button" onClick={() => setShowRaw((value) => !value)} className={cn("mt-2 inline-flex items-center gap-1 text-[11px] font-semibold", dark ? "text-white/45 hover:text-white" : "text-muted-foreground hover:text-foreground")} aria-expanded={showRaw}>
        <ChevronDown className={cn("size-3.5 transition-transform", showRaw && "rotate-180")} />{showRaw ? "Hide the original" : "Show the original"}
      </button>
      {showRaw && <p className={cn("mt-1.5 whitespace-pre-line rounded-xl p-2.5 text-xs leading-5", dark ? "bg-white/5 text-white/60" : "bg-muted/40 text-muted-foreground")}>{message.raw}</p>}

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {actions.dropIntoLink && !used && readText && (
          <Button size="sm" className="h-8 rounded-lg bg-ink text-white hover:bg-ink/90" onClick={() => { actions.dropIntoLink?.(message); void actions.markUsed(message.id, true) }}>
            <Check className="size-3.5" />Put in this link
          </Button>
        )}
        <Button size="sm" variant="outline" className={cn("h-8 rounded-lg", dark && outlineDark)} onClick={() => void actions.copy(copyText)}>
          <Copy className="size-3.5" />Copy
        </Button>
        {!used && readText && (
          <Button size="sm" variant="outline" className={cn("h-8 rounded-lg", dark && outlineDark)} onClick={() => actions.pocket(message)}>
            <Archive className="size-3.5" />Pocket it
          </Button>
        )}
        {!editing && readText && (
          <Button size="sm" variant="outline" className={cn("h-8 rounded-lg", dark && outlineDark)} onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />Edit
          </Button>
        )}
        {used ? (
          <Button size="sm" variant="outline" className={cn("h-8 rounded-lg", dark && outlineDark)} onClick={() => void actions.markUsed(message.id, false)}>
            <RotateCcw className="size-3.5" />Put back
          </Button>
        ) : (
          <Button size="sm" variant="outline" className={cn("h-8 rounded-lg", dark && outlineDark)} onClick={() => void actions.markUsed(message.id, true)}>
            <Check className="size-3.5" />Used
          </Button>
        )}
        <Button size="sm" variant="ghost" className={cn("h-8 rounded-lg", dark ? "text-white/40 hover:bg-white/10 hover:text-white" : "text-muted-foreground")} onClick={() => void actions.remove(message.id)} aria-label="Delete this message">
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

type PanelProps = {
  showId: string
  showDate: string
  dark?: boolean
  /** On the Producer Desk: drop the read version into the selected link's Moment. */
  onDropIntoLink?: (text: string, from: string) => void
}

export function ListenerMessagesPanel({ showId, showDate, dark = false, onDropIntoLink }: PanelProps) {
  const bank = useListenerMessages()
  const pocket = useParkedNotes()
  const [name, setName] = useState("")
  const [raw, setRaw] = useState("")
  const [source, setSource] = useState<MessageSource>("whatsapp")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("")

  function say(message: string, hold = 3500) {
    setNotice(message)
    window.setTimeout(() => setNotice((current) => (current === message ? "" : current)), hold)
  }

  async function bankIt() {
    if (!name.trim() || !raw.trim() || busy) return
    setBusy(true)
    try {
      const { message, readError } = await bank.add({ name: name.trim(), raw: raw.trim(), source, showId, showDate })
      setRaw("")
      setName("")
      if (message.readVersion) say("Banked, and the read version is ready.")
      else if (readError) say(`Banked. The read version failed this time (${readError}). Write it below or try again later.`, 6000)
      else say("Banked. The read version needs writing.", 5000)
    } catch (error) {
      say(error instanceof Error ? error.message : "The message did not save.", 6000)
    } finally {
      setBusy(false)
    }
  }

  const actions: CardActions = {
    saveRead: async (id, readVersion) => { try { await bank.patch(id, { readVersion }); say("Read version saved.") } catch (error) { say(error instanceof Error ? error.message : "Could not save.", 5000) } },
    markUsed: async (id, used) => { try { await bank.patch(id, { used }) } catch (error) { say(error instanceof Error ? error.message : "Could not update.", 5000) } },
    remove: async (id) => { await bank.remove(id) },
    copy: async (text) => { try { await navigator.clipboard.writeText(text); say("Copied.") } catch { say("Could not copy on this device.") } },
    pocket: (message) => {
      pocket.add({ text: message.readVersion ?? message.raw, source: message.source, sender: message.name, when: "later-today", showId, showDate })
      say(`In the Pocket for later: ${message.name}.`)
    },
    dropIntoLink: onDropIntoLink ? (message) => onDropIntoLink(message.readVersion ?? message.raw, message.name) : undefined,
  }

  const chip = (active: boolean) => cn(
    "min-h-9 flex-1 rounded-lg px-3 text-xs font-semibold transition-colors",
    active ? (dark ? "bg-white text-ink" : "bg-ink text-white") : (dark ? "text-white/50 hover:text-white" : "text-muted-foreground hover:text-foreground")
  )
  const field = cn(
    "w-full rounded-xl border px-3 py-2.5 text-sm leading-6 outline-none",
    dark ? "border-white/10 bg-black/25 text-white placeholder:text-white/30 focus:border-white/30" : "border-input bg-white placeholder:text-muted-foreground focus:border-ring"
  )

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Who sent it? Their name"
          className={cn("h-10 rounded-xl", dark && "border-white/10 bg-black/25 text-white placeholder:text-white/30")}
        />
        <textarea rows={5} value={raw} onChange={(event) => setRaw(event.target.value)} placeholder="Paste the whole message here…" className={cn(field, "resize-y")} />
        <div className={cn("inline-flex w-full rounded-xl border p-1", dark ? "border-white/10 bg-black/20" : "border-input bg-muted/40")} role="group" aria-label="Where it came from">
          {messageSources.map((option) => (
            <button key={option} type="button" aria-pressed={source === option} onClick={() => setSource(option)} className={chip(source === option)}>
              {messageSourceLabels[option]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className={cn("h-10 rounded-xl", dark ? "bg-white text-ink hover:bg-white/90" : "primary-action text-white")} onClick={() => void bankIt()} disabled={busy || !name.trim() || !raw.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
            {busy ? "Writing the read…" : "Bank it and write the read"}
          </Button>
          {notice && <span className={cn("text-xs font-semibold", dark ? "text-emerald-200" : "text-success")}>{notice}</span>}
        </div>
        {bank.ai === false && (
          <p className={cn("rounded-xl border p-2.5 text-[11px] leading-4", dark ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-amber-200 bg-amber-50 text-amber-800")}>
            The app can&apos;t write read versions yet: the AI key isn&apos;t set on the server. Messages still bank, and the read can be written in the box below or by the producer.
          </p>
        )}
        {bank.error && <p className={cn("text-[11px]", dark ? "text-amber-200/80" : "text-amber-700")}>{bank.error}</p>}
      </div>

      <div>
        <p className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", dark ? "text-white/40" : "text-muted-foreground")}>Recent · {bank.messages.length}</p>
        {bank.messages.length ? (
          <div className="mt-2 space-y-2">
            {bank.messages.map((message) => <MessageCard key={`${message.id}-${message.readStatus}`} message={message} dark={dark} actions={actions} />)}
          </div>
        ) : (
          <p className={cn("mt-2 rounded-xl border border-dashed p-3 text-xs leading-5", dark ? "border-white/10 text-white/35" : "border-border text-muted-foreground")}>
            {bank.loading ? "Loading…" : "Nothing banked yet. Paste the first one above."}
          </p>
        )}
      </div>
    </div>
  )
}

/** On Air: a button that opens the message bank in a side sheet. */
export function ListenerMessagesButton({ showId, showDate }: { showId: string; showDate: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className={cn("h-10 rounded-xl", outlineDark)} aria-label="Open the message bank">
          <MessageCircle className="size-4" />Messages
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-[#0b0c12] p-5 text-white sm:max-w-md">
        <SheetHeader className="p-0">
          <SheetTitle className="text-xl font-semibold tracking-[-0.03em] text-white">Messages</SheetTitle>
          <SheetDescription className="text-white/55">Paste a WhatsApp, name the person, and read it as them.</SheetDescription>
        </SheetHeader>
        <ListenerMessagesPanel showId={showId} showDate={showDate} dark />
      </SheetContent>
    </Sheet>
  )
}

/** Insights: everything one person has sent, read versions first. */
export function ListenerMessageHistory({ name }: { name: string }) {
  const bank = useListenerMessages({ name })
  if (bank.loading && !bank.messages.length) return <p className="text-xs text-muted-foreground">Loading their messages…</p>
  if (!bank.messages.length) return <p className="text-xs text-muted-foreground">No messages banked for {name} yet. Paste one in Messages, On Air or on the Desk.</p>
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Messages · {bank.messages.length}</p>
      {bank.messages.map((message) => (
        <div key={message.id} className="rounded-xl bg-muted/25 p-2.5">
          <p className="text-xs leading-5">{message.readVersion ?? message.raw}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{messageSourceLabels[message.source]} · {timeLabel(message.createdAt)}{message.showDate ? ` · show ${message.showDate}` : ""}{message.usedAt ? " · read on air" : ""}</p>
        </div>
      ))}
    </div>
  )
}
