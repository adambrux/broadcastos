"use client"

import { useState } from "react"
import { Archive, Check, ChevronDown, Copy, Inbox, RotateCcw, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useParkedNotes } from "@/lib/parked-notes"
import { parkedSourceLabels, parkedSources, type ParkedNote, type ParkedSource, type ParkedWhen } from "@/lib/parked-notes-shared"
import { cn } from "@/lib/utils"

/**
 * THE POCKET (v2.40). Mid-show, a message lands that belongs later: park it
 * here with two taps and the script stays exactly as it was. "Later today"
 * sits at the top until it is used; "Another day" waits for the producer, who
 * reads the Pocket when building the next plan.
 */

function timeLabel(iso: string) {
  try {
    const date = new Date(iso)
    const sameDay = date.toDateString() === new Date().toDateString()
    return date.toLocaleString("en-GB", sameDay
      ? { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }
      : { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })
  } catch {
    return ""
  }
}

type NoteActions = {
  markUsed: (id: string, used?: boolean) => void
  remove: (id: string) => void
  copy: (note: ParkedNote) => void
  dropIntoLink?: (note: ParkedNote) => void
}

const outlineDark = "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"

function NoteCard({ note, used = false, dark, actions }: { note: ParkedNote; used?: boolean; dark: boolean; actions: NoteActions }) {
  return (
    <div className={cn("rounded-2xl border p-3", dark ? "border-white/10 bg-black/20" : "border-border/70 bg-white", used && "opacity-70")}>
      <p className={cn("whitespace-pre-line text-sm leading-6", dark ? "text-white/85" : "text-foreground")}>{note.text}</p>
      <p className={cn("mt-2 text-[11px]", dark ? "text-white/40" : "text-muted-foreground")}>
        {parkedSourceLabels[note.source]}{note.sender ? ` · ${note.sender}` : ""} · {timeLabel(note.createdAt)}{used && note.usedAt ? ` · used ${timeLabel(note.usedAt)}` : ""}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {used ? (
          <Button size="sm" variant="outline" className={cn("h-8 rounded-lg", dark && outlineDark)} onClick={() => actions.markUsed(note.id, false)}>
            <RotateCcw className="size-3.5" />Put back
          </Button>
        ) : (
          <>
            {actions.dropIntoLink && (
              <Button size="sm" className="h-8 rounded-lg bg-ink text-white hover:bg-ink/90" onClick={() => { actions.dropIntoLink?.(note); actions.markUsed(note.id) }}>
                <Check className="size-3.5" />Put in this link
              </Button>
            )}
            <Button size="sm" variant="outline" className={cn("h-8 rounded-lg", dark && outlineDark)} onClick={() => actions.markUsed(note.id)}>
              <Check className="size-3.5" />Used
            </Button>
            <Button size="sm" variant="outline" className={cn("h-8 rounded-lg", dark && outlineDark)} onClick={() => actions.copy(note)}>
              <Copy className="size-3.5" />Copy
            </Button>
          </>
        )}
        <Button size="sm" variant="ghost" className={cn("h-8 rounded-lg", dark ? "text-white/40 hover:bg-white/10 hover:text-white" : "text-muted-foreground")} onClick={() => actions.remove(note.id)} aria-label="Delete this note">
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

function Group({ title, notes, empty, dark, actions }: { title: string; notes: ParkedNote[]; empty: string; dark: boolean; actions: NoteActions }) {
  return (
    <div>
      <p className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", dark ? "text-white/40" : "text-muted-foreground")}>{title} · {notes.length}</p>
      {notes.length ? (
        <div className="mt-2 space-y-2">{notes.map((note) => <NoteCard key={note.id} note={note} dark={dark} actions={actions} />)}</div>
      ) : (
        <p className={cn("mt-2 rounded-xl border border-dashed p-3 text-xs leading-5", dark ? "border-white/10 text-white/35" : "border-border text-muted-foreground")}>{empty}</p>
      )}
    </div>
  )
}

type PanelProps = {
  showId: string
  showDate: string
  dark?: boolean
  /** On the Producer Desk: drop the note into the selected link's Moment. */
  onDropIntoLink?: (note: ParkedNote) => void
}

export function ParkedPocketPanel({ showId, showDate, dark = false, onDropIntoLink }: PanelProps) {
  const pocket = useParkedNotes()
  const [text, setText] = useState("")
  const [sender, setSender] = useState("")
  const [source, setSource] = useState<ParkedSource>("whatsapp")
  const [when, setWhen] = useState<ParkedWhen>("later-today")
  const [notice, setNotice] = useState("")
  const [usedOpen, setUsedOpen] = useState(false)

  function say(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2500)
  }

  function park() {
    const note = pocket.add({ text, source, sender, when, showId, showDate })
    if (!note) return
    setText("")
    setSender("")
    say(when === "later-today" ? "Parked for later in the show." : "Parked for another day.")
  }

  async function copy(note: ParkedNote) {
    try {
      await navigator.clipboard.writeText(note.text)
      say("Copied.")
    } catch {
      say("Could not copy on this device.")
    }
  }

  const actions: NoteActions = {
    markUsed: pocket.markUsed,
    remove: pocket.remove,
    copy: (note) => { void copy(note) },
    dropIntoLink: onDropIntoLink,
  }

  const later = pocket.open.filter((note) => note.when === "later-today")
  const another = pocket.open.filter((note) => note.when !== "later-today")

  const chip = (active: boolean) => cn(
    "min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors",
    active ? (dark ? "bg-white text-ink" : "bg-ink text-white") : (dark ? "text-white/50 hover:text-white" : "text-muted-foreground hover:text-foreground")
  )
  const field = cn(
    "w-full rounded-xl border px-3 py-2.5 text-sm leading-6 outline-none",
    dark ? "border-white/10 bg-black/25 text-white placeholder:text-white/30 focus:border-white/30" : "border-input bg-white placeholder:text-muted-foreground focus:border-ring"
  )
  const group = cn("inline-flex w-full rounded-xl border p-1", dark ? "border-white/10 bg-black/20" : "border-input bg-muted/40")

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <textarea
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste the WhatsApp, or type the thought…"
          className={cn(field, "resize-y")}
        />
        <Input
          value={sender}
          onChange={(event) => setSender(event.target.value)}
          placeholder="From (optional)"
          className={cn("h-10 rounded-xl", dark && "border-white/10 bg-black/25 text-white placeholder:text-white/30")}
        />
        <div className={group} role="group" aria-label="Where it came from">
          {parkedSources.map((option) => (
            <button key={option} type="button" aria-pressed={source === option} onClick={() => setSource(option)} className={cn(chip(source === option), "flex-1")}>
              {parkedSourceLabels[option]}
            </button>
          ))}
        </div>
        <div className={group} role="group" aria-label="When it is for">
          <button type="button" aria-pressed={when === "later-today"} onClick={() => setWhen("later-today")} className={cn(chip(when === "later-today"), "flex-1")}>Later today</button>
          <button type="button" aria-pressed={when === "another-day"} onClick={() => setWhen("another-day")} className={cn(chip(when === "another-day"), "flex-1")}>Another day</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className={cn("h-10 rounded-xl", dark ? "bg-white text-ink hover:bg-white/90" : "primary-action text-white")} onClick={park} disabled={!text.trim()}>
            <Archive className="size-4" />Park it
          </Button>
          {notice && <span className={cn("text-xs font-semibold", dark ? "text-emerald-200" : "text-success")}>{notice}</span>}
          {pocket.online === false && !notice && (
            <span className={cn("text-[11px]", dark ? "text-amber-200/80" : "text-amber-700")}>Saving on this device only until the app is back online or you sign in.</span>
          )}
        </div>
      </div>

      <Group title="Later today" notes={later} empty="Nothing parked for later in the show." dark={dark} actions={actions} />
      <Group title="Another day" notes={another} empty="Nothing waiting for another day. The producer reads this list when building the next plan." dark={dark} actions={actions} />

      {pocket.used.length > 0 && (
        <div>
          <button type="button" onClick={() => setUsedOpen((value) => !value)} className={cn("flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em]", dark ? "text-white/40" : "text-muted-foreground")} aria-expanded={usedOpen}>
            <span>Used this week · {pocket.used.length}</span>
            <ChevronDown className={cn("size-4 transition-transform", usedOpen && "rotate-180")} />
          </button>
          {usedOpen && <div className="mt-2 space-y-2">{pocket.used.map((note) => <NoteCard key={note.id} note={note} used dark={dark} actions={actions} />)}</div>}
        </div>
      )}
    </div>
  )
}

/** On Air: a button that opens the Pocket in a side sheet, with the open count on it. */
export function ParkedPocketButton({ showId, showDate, dark = true }: { showId: string; showDate: string; dark?: boolean }) {
  const pocket = useParkedNotes()
  const count = pocket.open.length
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-10 rounded-xl", dark && "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white")}
          aria-label={`Open the Pocket, ${count} parked`}
        >
          <Inbox className="size-4" />Pocket
          {count > 0 && <Badge className={cn("ml-1 px-1.5 py-0 text-[10px]", dark ? "bg-amber-300 text-ink" : "bg-ink text-white")}>{count}</Badge>}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={cn("w-full overflow-y-auto p-5 sm:max-w-md", dark && "border-white/10 bg-[#0b0c12] text-white")}>
        <SheetHeader className="p-0">
          <SheetTitle className={cn("text-xl font-semibold tracking-[-0.03em]", dark && "text-white")}>Pocket</SheetTitle>
          <SheetDescription className={cn(dark && "text-white/55")}>Park a WhatsApp or a thought for later, without touching the script.</SheetDescription>
        </SheetHeader>
        <ParkedPocketPanel showId={showId} showDate={showDate} dark={dark} />
      </SheetContent>
    </Sheet>
  )
}
